import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { LESSONS_META, TRACKS } from '../seed/taxonomy';
import {
  computeTopicFit,
  convertDifficulty,
  normalizeTopicLabels,
  parseRawMarkdownSeed,
  validateLessonGraphAcyclic,
} from '../seed/rawParser';
import { generateNativeProblems } from '../seed/nativeProblems';
import { openDatabase, seedDatabase } from '../db/database';

const ASSETS_DIR = path.resolve(process.cwd(), 'public/assets/aistudio');

describe('Seed & Content Pipeline (§6.5, §6.7, §8.6)', () => {
  it('has 7 tracks and 74 acyclic lessons with corrected prerequisites 6.1, 6.5, 6.7', () => {
    assert.equal(TRACKS.length, 7);
    assert.equal(LESSONS_META.length, 74);

    const dag = validateLessonGraphAcyclic();
    assert.equal(dag.ok, true, dag.error);

    const byCode = new Map(LESSONS_META.map((l) => [l.code, l]));
    assert.deepEqual(byCode.get('6.1')?.prereqs, ['2.8', '3.6']);
    assert.deepEqual(byCode.get('6.5')?.prereqs, ['1.2']);
    assert.deepEqual(byCode.get('6.7')?.prereqs, ['4.4', '5.6']);

    for (const l of LESSONS_META) {
      assert.ok(l.quiz.length >= 3, `Lesson ${l.code} must have >= 3 quiz questions`);
      assert.ok(l.objectives.length >= 3, `Lesson ${l.code} must have >= 3 objectives`);
    }
  });

  it('parses all raw khung_noi_dung & bo_sung files accurately', () => {
    const res = parseRawMarkdownSeed(ASSETS_DIR);
    assert.equal(res.lessons.size, 74);

    const totalKhung = Object.values(res.rawStats.khungRowsByLevel).reduce((a, b) => a + b, 0);
    const totalBosung = Object.values(res.rawStats.bosungRowsByLevel).reduce((a, b) => a + b, 0);

    // §2 counting table: 217 khung rows, 168 bo_sung rows
    assert.equal(totalKhung, 217, `Expected 217 khung rows, got ${totalKhung}`);
    assert.equal(totalBosung, 168, `Expected 168 bo_sung rows, got ${totalBosung}`);
    assert.equal(res.rawStats.unmappedLabels.length, 0, `Unmapped labels: ${res.rawStats.unmappedLabels.join(', ')}`);

    // Check CSES missing ID resolution (§2 #4)
    const maxSubarray = res.problems.find((p) => p.title.toLowerCase() === 'maximum subarray sum');
    assert.equal(maxSubarray?.source_id, '1643');
    const staticRangeSum = res.problems.find((p) => p.title.toLowerCase() === 'static range sum queries');
    assert.equal(staticRangeSum?.source_id, '1646');

    // Check external allowlist
    for (const p of res.problems) {
      assert.ok(p.source_url.startsWith('https://'), `Invalid source_url: ${p.source_url}`);
      assert.ok(/^[a-z0-9][a-z0-9-]{1,63}$/.test(p.slug), `Invalid slug: ${p.slug}`);
    }
  });

  it('enforces the 3 mandatory topic_fit unit test cases from §6.5', () => {
    const byCode = new Map(LESSONS_META.map((l) => [l.code, l]));

    // Case 1: Planets Queries I (binary-lifting, graphs) in 4.1 Dijkstra from bo_sung -> auto_rejected
    const fit1 = computeTopicFit(byCode.get('4.1')!.topics, ['binary-lifting', 'graphs'], true);
    assert.equal(fit1, 'weak'); // only generic 'graphs' overlaps, so bo_sung rule rejects it!

    // Case 2: Shortest Routes I (dijkstra) in 4.1 -> strong
    const fit2 = computeTopicFit(byCode.get('4.1')!.topics, ['dijkstra', 'shortest-paths', 'graphs'], true);
    assert.equal(fit2, 'strong');

    // Case 3: Necessary Roads (bridges, graphs) in 5.8 CHT -> none -> auto_rejected
    const fit3 = computeTopicFit(byCode.get('5.8')!.topics, ['bridges', 'graphs'], true);
    assert.equal(fit3, 'none');

    // Also verify actual parsed bo_sung links in rawParser output
    const parsed = parseRawMarkdownSeed(ASSETS_DIR);
    const link1 = parsed.lessonProblems.find(
      (lp) => lp.lesson_code === '4.1' && lp.problem_slug === 'cses-1750'
    );
    assert.equal(link1?.review_status, 'auto_rejected');

    const link3 = parsed.lessonProblems.find(
      (lp) => lp.lesson_code === '5.8' && lp.problem_slug === 'cses-2076'
    );
    assert.equal(link3?.review_status, 'auto_rejected');
  });

  it('normalizes CF/AtCoder/LC difficulties and generates 43 native problems with sufficient tests', () => {
    assert.equal(convertDifficulty('1200', 3, 'Codeforces', '100A').difficulty, 'Khởi động');
    assert.equal(convertDifficulty('1500', 3, 'Codeforces', '100B').difficulty, 'Thử thách');
    assert.equal(convertDifficulty('D', 3, 'AtCoder', 'dp_a').difficulty, 'Khởi động');
    assert.equal(convertDifficulty('D', 3, 'AtCoder', 'dp_h').difficulty, 'Luyện tập');
    assert.equal(convertDifficulty('D', 3, 'AtCoder', 'dp_z').difficulty, 'Thử thách');
    assert.equal(convertDifficulty('-', 6, 'LibraryChecker', 'convolution_mod').difficulty, 'Thử thách');

    const { slugs } = normalizeTopicLabels('dp, trees, bitmasks');
    assert.ok(slugs.includes('tree-dp'));
    assert.ok(slugs.includes('bitmask-dp'));

    const natives = generateNativeProblems();
    assert.equal(natives.length, 43);
    for (const np of natives) {
      const minTests = np.level <= 2 ? 20 : 30;
      assert.ok(np.tests.length >= minTests, `${np.slug} has only ${np.tests.length} tests (< ${minTests})`);
      assert.equal(np.hints.length, 4, `${np.slug} must have 4 hints`);
      assert.ok(np.samples.length >= 1, `${np.slug} must have >= 1 sample`);
    }
  });

  it('seeds SQLite DB idempotently without duplicating rows or overwriting manual reviews', () => {
    const db = openDatabase(':memory:');
    const first = seedDatabase(db, ASSETS_DIR);
    assert.equal(first.skipped, false);
    const second = seedDatabase(db, ASSETS_DIR);
    assert.equal(second.skipped, true);

    const lessonCount = (db.prepare('SELECT COUNT(*) AS c FROM lessons').get() as { c: number }).c;
    const nativeCount = (db.prepare("SELECT COUNT(*) AS c FROM problems WHERE kind = 'native'").get() as { c: number }).c;
    assert.equal(lessonCount, 74);
    assert.equal(nativeCount, 43);
  });
});
