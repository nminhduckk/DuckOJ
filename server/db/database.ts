import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { LESSONS_META, TOPICS, TOPIC_ALIASES, TRACKS } from '../seed/taxonomy';
import { parseRawMarkdownSeed, validateLessonGraphAcyclic } from '../seed/rawParser';
import { generateNativeProblems } from '../seed/nativeProblems';
import { hashPassword } from '../services/auth';

export const DEFAULT_DB_PATH = path.resolve(process.cwd(), '.data/duckoj.db');
export const ASSETS_DIR = path.resolve(process.cwd(), 'public/assets/aistudio');

export function openDatabase(dbPath = DEFAULT_DB_PATH): DatabaseSync {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');
  initSchema(db);
  return db;
}

export function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      public_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      handle TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','reviewer','admin')),
      is_active INTEGER NOT NULL DEFAULT 1,
      email_verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      family_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY CHECK (id BETWEEN 0 AND 6),
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      estimated_duration TEXT NOT NULL,
      cf_rating_range TEXT NOT NULL,
      problem_rating_min INTEGER NOT NULL,
      problem_rating_max INTEGER NOT NULL,
      release_wave INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS topics (
      slug TEXT PRIMARY KEY,
      name_vi TEXT NOT NULL,
      cf_tag TEXT,
      is_generic INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS topic_aliases (
      alias TEXT PRIMARY KEY,
      topic_slug TEXT NOT NULL REFERENCES topics(slug)
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      track_id INTEGER NOT NULL REFERENCES tracks(id),
      sort_order INTEGER NOT NULL,
      title TEXT NOT NULL,
      objectives_md TEXT NOT NULL DEFAULT '',
      theory_md TEXT NOT NULL DEFAULT '',
      code_sample TEXT NOT NULL DEFAULT '',
      code_sample_ok INTEGER NOT NULL DEFAULT 0,
      complexity TEXT NOT NULL DEFAULT '',
      common_mistakes_md TEXT NOT NULL DEFAULT '',
      sources TEXT NOT NULL DEFAULT '[]',
      hints TEXT NOT NULL DEFAULT '[]',
      quiz TEXT NOT NULL DEFAULT '[]',
      fit_check INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','published','archived')),
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewed_at TEXT,
      content_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lesson_prereqs (
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      prereq_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      PRIMARY KEY (lesson_id, prereq_id),
      CHECK (lesson_id <> prereq_id)
    );

    CREATE TABLE IF NOT EXISTS lesson_topics (
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      topic_slug TEXT NOT NULL REFERENCES topics(slug),
      PRIMARY KEY (lesson_id, topic_slug)
    );

    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL CHECK (kind IN ('external','native')),
      title TEXT NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('CSES','Codeforces','AtCoder','USACO','VNOJ','Kattis','LibraryChecker','Native','Other')),
      source_id TEXT NOT NULL,
      source_url TEXT,
      year INTEGER,
      level INTEGER NOT NULL REFERENCES tracks(id),
      difficulty TEXT NOT NULL CHECK (difficulty IN ('Khởi động','Luyện tập','Thử thách')),
      cf_rating INTEGER,
      editorial_url TEXT,
      license_note TEXT NOT NULL DEFAULT '',
      hints TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','published','archived')),
      seed_origin TEXT,
      link_ok INTEGER,
      link_checked_at TEXT,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewed_at TEXT,
      content_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (source, source_id)
    );
    CREATE INDEX IF NOT EXISTS problems_level_diff_idx ON problems (level, difficulty);

    CREATE TABLE IF NOT EXISTS problem_topics (
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      topic_slug TEXT NOT NULL REFERENCES topics(slug),
      PRIMARY KEY (problem_id, topic_slug)
    );

    CREATE TABLE IF NOT EXISTS lesson_problems (
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      tier TEXT NOT NULL CHECK (tier IN ('Khởi động','Luyện tập','Thử thách')),
      sort_order INTEGER NOT NULL DEFAULT 0,
      review_status TEXT NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','approved','rejected','auto_rejected')),
      topic_fit TEXT,
      reviewer_note TEXT,
      reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      reviewed_at TEXT,
      PRIMARY KEY (lesson_id, problem_id)
    );
    CREATE INDEX IF NOT EXISTS lesson_problems_problem_idx ON lesson_problems (problem_id);
    CREATE INDEX IF NOT EXISTS lesson_problems_lesson_idx ON lesson_problems (lesson_id, review_status, sort_order);

    CREATE TABLE IF NOT EXISTS native_problems (
      problem_id INTEGER PRIMARY KEY REFERENCES problems(id) ON DELETE CASCADE,
      statement_md TEXT NOT NULL,
      input_spec_md TEXT NOT NULL DEFAULT '',
      output_spec_md TEXT NOT NULL DEFAULT '',
      notes_md TEXT NOT NULL DEFAULT '',
      samples TEXT NOT NULL DEFAULT '[]',
      time_limit_ms INTEGER NOT NULL DEFAULT 1000,
      memory_limit_mb INTEGER NOT NULL DEFAULT 256,
      output_limit_kb INTEGER NOT NULL DEFAULT 65536,
      checker TEXT NOT NULL DEFAULT 'tokens' CHECK (checker IN ('tokens','lines','float','custom')),
      checker_params TEXT NOT NULL DEFAULT '{}',
      scoring TEXT NOT NULL DEFAULT 'all_or_nothing' CHECK (scoring IN ('all_or_nothing','per_test','subtasks')),
      allowed_languages TEXT NOT NULL DEFAULT '["cpp17","python3"]',
      active_test_set_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS test_sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      version INTEGER NOT NULL,
      storage_key TEXT NOT NULL,
      sha256 TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      manifest TEXT NOT NULL,
      tests_json TEXT NOT NULL,
      checker_storage_key TEXT,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      verified_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (problem_id, version)
    );

    CREATE TABLE IF NOT EXISTS contests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description_md TEXT NOT NULL DEFAULT '',
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      scoring TEXT NOT NULL DEFAULT 'icpc' CHECK (scoring IN ('icpc','oi')),
      penalty_minutes INTEGER NOT NULL DEFAULT 20,
      is_public INTEGER NOT NULL DEFAULT 1,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contest_problems (
      contest_id INTEGER NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL REFERENCES problems(id),
      label TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      points INTEGER NOT NULL DEFAULT 100,
      PRIMARY KEY (contest_id, problem_id),
      UNIQUE (contest_id, label)
    );

    CREATE TABLE IF NOT EXISTS contest_participants (
      contest_id INTEGER NOT NULL REFERENCES contests(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (contest_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL REFERENCES problems(id),
      contest_id INTEGER REFERENCES contests(id),
      test_set_id INTEGER REFERENCES test_sets(id),
      language TEXT NOT NULL CHECK (language IN ('cpp17','python3','java21')),
      source_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','judging','done','system_error')),
      verdict TEXT CHECK (verdict IN ('AC','WA','TLE','MLE','RE','CE','OLE','SE')),
      score INTEGER NOT NULL DEFAULT 0,
      max_time_ms INTEGER,
      max_memory_kb INTEGER,
      tests_passed INTEGER,
      tests_total INTEGER,
      failed_test TEXT,
      compile_log TEXT,
      judge_worker TEXT,
      attempts INTEGER NOT NULL DEFAULT 0,
      claimed_at TEXT,
      heartbeat_at TEXT,
      finished_at TEXT,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS submissions_user_idx ON submissions (user_id, id DESC);
    CREATE INDEX IF NOT EXISTS submissions_problem_user_idx ON submissions (problem_id, user_id);

    CREATE TABLE IF NOT EXISTS submission_tests (
      submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
      test_name TEXT NOT NULL,
      grp TEXT,
      ord INTEGER NOT NULL,
      verdict TEXT NOT NULL CHECK (verdict IN ('AC','WA','TLE','MLE','RE','CE','OLE','SE')),
      time_ms INTEGER,
      memory_kb INTEGER,
      is_sample INTEGER NOT NULL DEFAULT 0,
      checker_msg TEXT,
      stdin_preview TEXT,
      stdout_preview TEXT,
      expected_preview TEXT,
      PRIMARY KEY (submission_id, test_name)
    );

    CREATE TABLE IF NOT EXISTS progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','attempted','solved','mastered')),
      attempts INTEGER NOT NULL DEFAULT 0,
      solved_via TEXT CHECK (solved_via IN ('judge','self_report')),
      first_solved_at TEXT,
      last_attempt_at TEXT,
      hint_level INTEGER NOT NULL DEFAULT 0,
      hint_unlocked_at TEXT,
      first_opened_at TEXT,
      notes TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (user_id, problem_id)
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','reading','done')),
      quiz_best_score INTEGER,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      target_type TEXT NOT NULL CHECK (target_type IN ('lesson','problem','test','copyright','other')),
      target_id TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved','dismissed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      diff TEXT,
      at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS seed_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      git_sha TEXT,
      stats TEXT NOT NULL,
      started_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    DROP VIEW IF EXISTS v_lesson_stats;
    CREATE VIEW v_lesson_stats AS
    SELECT
      l.id AS lesson_id,
      l.code,
      l.title,
      l.track_id,
      SUM(CASE WHEN lp.review_status = 'approved' AND p.status = 'published' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN lp.review_status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN lp.review_status = 'auto_rejected' THEN 1 ELSE 0 END) AS auto_rejected,
      SUM(CASE WHEN lp.topic_fit = 'strong' THEN 1 ELSE 0 END) AS strong_count,
      SUM(CASE WHEN lp.topic_fit = 'weak' THEN 1 ELSE 0 END) AS weak_count,
      SUM(CASE WHEN lp.topic_fit = 'none' THEN 1 ELSE 0 END) AS none_count
    FROM lessons l
    LEFT JOIN lesson_problems lp ON lp.lesson_id = l.id
    LEFT JOIN problems p ON p.id = lp.problem_id
    GROUP BY l.id, l.code;
  `);
}

function hashObj(v: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
}

export function seedDatabase(db: DatabaseSync, assetsDir = ASSETS_DIR): { skipped: boolean; stats: Record<string, unknown> } {
  const dagCheck = validateLessonGraphAcyclic();
  if (!dagCheck.ok) {
    throw new Error(`Invalid lesson DAG: ${dagCheck.error}`);
  }

  const parsed = parseRawMarkdownSeed(assetsDir);
  const natives = generateNativeProblems();
  const seedFingerprint = hashObj({
    tracks: TRACKS,
    topics: TOPICS,
    lessonsMeta: LESSONS_META,
    parsedProblems: parsed.problems,
    parsedLinks: parsed.lessonProblems,
    natives,
    contestCopyVersion: 2,
  });

  const existingSeed = db
    .prepare('SELECT id, stats FROM seed_runs WHERE git_sha = ? ORDER BY id DESC LIMIT 1')
    .get(seedFingerprint) as { id: number; stats: string } | undefined;

  if (existingSeed) {
    return { skipped: true, stats: JSON.parse(existingSeed.stats) };
  }

  db.exec('BEGIN IMMEDIATE;');
  try {
    const nowIso = new Date().toISOString();

    // 1. Seed default accounts (idempotent)
    const ensureUser = (email: string, handle: string, name: string, pw: string, role: 'student' | 'reviewer' | 'admin') => {
      const ex = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: number } | undefined;
      if (ex) return Number(ex.id);
      const res = db
        .prepare(
          'INSERT INTO users (public_id, email, handle, name, password_hash, role, email_verified_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        )
        .run(crypto.randomUUID(), email, handle, name, hashPassword(pw), role, nowIso);
      return Number(res.lastInsertRowid);
    };

    const studentId = ensureUser('student@duckoj.vn', 'duck_learner', 'Nguyễn Minh Đức', 'student123', 'student');
    const reviewerId = ensureUser('reviewer@duckoj.vn', 'duck_reviewer', 'Trần Thu Hà', 'reviewer123', 'reviewer');
    const adminId = ensureUser('admin@duckoj.vn', 'duck_admin', 'Quản trị viên DuckOJ', 'admin123', 'admin');
    const rivalId = ensureUser('coder_linh@duckoj.vn', 'linh_cp', 'Lê Khánh Linh', 'student123', 'student');

    // 2. Seed tracks
    const upsertTrack = db.prepare(`
      INSERT INTO tracks (id, name, description, estimated_duration, cf_rating_range, problem_rating_min, problem_rating_max, release_wave, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        estimated_duration = excluded.estimated_duration,
        cf_rating_range = excluded.cf_rating_range,
        problem_rating_min = excluded.problem_rating_min,
        problem_rating_max = excluded.problem_rating_max,
        release_wave = excluded.release_wave,
        sort_order = excluded.sort_order
    `);
    for (const t of TRACKS) {
      upsertTrack.run(
        t.id,
        t.name,
        t.description,
        t.estimated_duration,
        t.cf_rating_range,
        t.problem_rating_min,
        t.problem_rating_max,
        t.release_wave,
        t.sort_order
      );
    }

    // 3. Seed topics & aliases
    const upsertTopic = db.prepare(`
      INSERT INTO topics (slug, name_vi, cf_tag, is_generic) VALUES (?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET name_vi = excluded.name_vi, cf_tag = excluded.cf_tag, is_generic = excluded.is_generic
    `);
    for (const tp of TOPICS) {
      upsertTopic.run(tp.slug, tp.name_vi, tp.cf_tag ?? null, tp.is_generic ? 1 : 0);
    }

    const upsertAlias = db.prepare(`
      INSERT INTO topic_aliases (alias, topic_slug) VALUES (?, ?)
      ON CONFLICT(alias) DO UPDATE SET topic_slug = excluded.topic_slug
    `);
    for (const [alias, slugs] of Object.entries(TOPIC_ALIASES)) {
      if (slugs.length > 0 && TOPICS.some((t) => t.slug === slugs[0])) {
        upsertAlias.run(alias, slugs[0]);
      }
    }

    // 4. Seed 74 lessons (preserve manual reviewer status on updates!)
    const lessonIdByCode = new Map<string, number>();
    const selectLesson = db.prepare('SELECT id, content_hash FROM lessons WHERE code = ?');
    const insertLesson = db.prepare(`
      INSERT INTO lessons (
        code, slug, track_id, sort_order, title, objectives_md, theory_md,
        code_sample, code_sample_ok, complexity, common_mistakes_md,
        sources, hints, quiz, fit_check, status, reviewed_by, reviewed_at, content_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
    `);
    const updateLesson = db.prepare(`
      UPDATE lessons SET
        slug = ?, track_id = ?, sort_order = ?, title = ?, objectives_md = ?,
        theory_md = ?, code_sample = ?, code_sample_ok = ?, complexity = ?,
        common_mistakes_md = ?, sources = ?, hints = ?, quiz = ?, fit_check = ?,
        content_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    for (const meta of LESSONS_META) {
      const content = parsed.lessons.get(meta.code)!;
      const objectivesMd = meta.objectives.map((o) => `- ${o}`).join('\n');
      const lessonHints = [
        { level: 1, type: 'nudge', text_md: `Đọc kỹ điều kiện biên và độ phức tạp yêu cầu (${meta.complexity}) của bài **${meta.title}**.` },
        { level: 2, type: 'approach', text_md: `Phác thảo trạng thái cốt lõi và công thức chuyển đổi trước khi cài đặt.` },
        { level: 3, type: 'idea', text_md: `Kiểm tra lại các lỗi hay gặp trong mục 4 (Lỗi thường gặp) như tràn số \`long long\` hoặc nhầm chỉ số 0/1-based.` },
        { level: 4, type: 'code', text_md: 'Xem đầy đủ cài đặt ở mục **2. Code mẫu C++** phía trên.' },
      ];

      const chash = hashObj({ meta, content });
      const existing = selectLesson.get(meta.code) as { id: number; content_hash: string | null } | undefined;
      let lessonId: number;
      if (!existing) {
        const res = insertLesson.run(
          meta.code,
          meta.slug,
          meta.track_id,
          meta.sort_order,
          meta.title,
          objectivesMd,
          content.theory_md,
          content.code_sample,
          content.code_sample_ok ? 1 : 0,
          meta.complexity,
          content.common_mistakes_md,
          JSON.stringify(meta.sources),
          JSON.stringify(lessonHints),
          JSON.stringify(meta.quiz),
          meta.fit_check ? 1 : 0,
          reviewerId,
          nowIso,
          chash
        );
        lessonId = Number(res.lastInsertRowid);
      } else {
        lessonId = Number(existing.id);
        if (existing.content_hash !== chash) {
          updateLesson.run(
            meta.slug,
            meta.track_id,
            meta.sort_order,
            meta.title,
            objectivesMd,
            content.theory_md,
            content.code_sample,
            content.code_sample_ok ? 1 : 0,
            meta.complexity,
            content.common_mistakes_md,
            JSON.stringify(meta.sources),
            JSON.stringify(lessonHints),
            JSON.stringify(meta.quiz),
            meta.fit_check ? 1 : 0,
            chash,
            lessonId
          );
        }
      }
      lessonIdByCode.set(meta.code, lessonId);
    }

    // Lesson prereqs & topics
    const insertPrereq = db.prepare('INSERT OR IGNORE INTO lesson_prereqs (lesson_id, prereq_id) VALUES (?, ?)');
    const insertLessonTopic = db.prepare('INSERT OR IGNORE INTO lesson_topics (lesson_id, topic_slug) VALUES (?, ?)');
    for (const meta of LESSONS_META) {
      const lid = lessonIdByCode.get(meta.code)!;
      for (const pCode of meta.prereqs) {
        const pid = lessonIdByCode.get(pCode);
        if (pid) insertPrereq.run(lid, pid);
      }
      for (const ts of meta.topics) {
        insertLessonTopic.run(lid, ts);
      }
    }

    // 5. Seed External Problems
    const problemIdBySlug = new Map<string, number>();
    const selectProb = db.prepare('SELECT id FROM problems WHERE source = ? AND source_id = ?');
    const insertProb = db.prepare(`
      INSERT INTO problems (
        slug, kind, title, source, source_id, source_url, level, difficulty, cf_rating,
        editorial_url, license_note, hints, status, seed_origin, link_ok, link_checked_at,
        reviewed_by, reviewed_at, content_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertProbTopic = db.prepare('INSERT OR IGNORE INTO problem_topics (problem_id, topic_slug) VALUES (?, ?)');

    const updateProbLicense = db.prepare('UPDATE problems SET license_note = ? WHERE id = ? AND license_note <> ?');
    for (const p of parsed.problems) {
      const existing = selectProb.get(p.source, p.source_id) as { id: number } | undefined;
      let pid: number;
      if (!existing) {
        const chash = hashObj(p);
        const res = insertProb.run(
          p.slug,
          p.kind,
          p.title,
          p.source,
          p.source_id,
          p.source_url,
          p.level,
          p.difficulty,
          p.cf_rating,
          p.editorial_url,
          p.license_note,
          p.status,
          p.seed_origin,
          p.link_ok ? 1 : 0,
          nowIso,
          reviewerId,
          nowIso,
          chash
        );
        pid = Number(res.lastInsertRowid);
      } else {
        pid = Number(existing.id);
        updateProbLicense.run(p.license_note, pid, p.license_note);
      }
      problemIdBySlug.set(p.slug, pid);
      for (const ts of p.topics) {
        if (TOPICS.some((t) => t.slug === ts)) {
          insertProbTopic.run(pid, ts);
        }
      }
    }

    // Seed lesson_problems for external (do NOT overwrite existing manual review_status!)
    const insertLp = db.prepare(`
      INSERT OR IGNORE INTO lesson_problems (
        lesson_id, problem_id, tier, sort_order, review_status, topic_fit, reviewer_note, reviewed_by, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const lp of parsed.lessonProblems) {
      const lid = lessonIdByCode.get(lp.lesson_code);
      const pid = problemIdBySlug.get(lp.problem_slug);
      if (!lid || !pid) continue;
      insertLp.run(
        lid,
        pid,
        lp.tier,
        lp.sort_order,
        lp.review_status,
        lp.topic_fit,
        lp.reviewer_note,
        lp.review_status === 'approved' ? reviewerId : null,
        lp.review_status === 'approved' ? nowIso : null
      );
    }

    // 6. Seed 43 Native Problems + Verified Test Sets
    const insertNativeProb = db.prepare(`
      INSERT OR IGNORE INTO problems (
        slug, kind, title, source, source_id, source_url, level, difficulty, cf_rating,
        editorial_url, license_note, hints, status, seed_origin, link_ok, reviewed_by, reviewed_at, content_hash
      ) VALUES (?, 'native', ?, 'Native', ?, NULL, ?, ?, NULL, NULL, ?, ?, 'published', 'native-kit', 1, ?, ?, ?)
    `);
    const insertNativeDetail = db.prepare(`
      INSERT OR REPLACE INTO native_problems (
        problem_id, statement_md, input_spec_md, output_spec_md, notes_md, samples,
        time_limit_ms, memory_limit_mb, output_limit_kb, checker, checker_params, scoring, allowed_languages, active_test_set_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'all_or_nothing', '["cpp17","python3"]', ?)
    `);
    const insertTestSet = db.prepare(`
      INSERT INTO test_sets (
        problem_id, version, storage_key, sha256, size_bytes, manifest, tests_json, created_by, verified_at
      ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateNativeProb = db.prepare(`
      UPDATE problems SET
        title = ?, level = ?, difficulty = ?, license_note = ?, hints = ?, content_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    const updateTestSet = db.prepare(`
      UPDATE test_sets SET
        sha256 = ?, size_bytes = ?, manifest = ?, tests_json = ?, verified_at = ?
      WHERE id = ?
    `);

    for (const np of natives) {
      const chash = hashObj({ title: np.title, level: np.level, tier: np.tier, hints: np.hints, license_note: np.license_note });
      const existing = selectProb.get('Native', np.slug) as { id: number } | undefined;
      let pid: number;
      if (!existing) {
        const res = insertNativeProb.run(
          np.slug,
          np.title,
          np.slug,
          np.level,
          np.tier,
          np.license_note,
          JSON.stringify(np.hints),
          adminId,
          nowIso,
          chash
        );
        pid = Number(res.lastInsertRowid);
      } else {
        pid = Number(existing.id);
        updateNativeProb.run(
          np.title,
          np.level,
          np.tier,
          np.license_note,
          JSON.stringify(np.hints),
          chash,
          pid
        );
      }
      problemIdBySlug.set(np.slug, pid);

      for (const ts of np.topics) {
        if (TOPICS.some((t) => t.slug === ts)) insertProbTopic.run(pid, ts);
      }

      const manifest = np.tests.map((t) => ({
        name: t.name,
        group: t.grp,
        is_sample: t.is_sample,
        sha256_in: crypto.createHash('sha256').update(t.input).digest('hex'),
        sha256_out: crypto.createHash('sha256').update(t.expected).digest('hex'),
      }));
      const testsJson = JSON.stringify(np.tests);
      const tsSha = crypto.createHash('sha256').update(testsJson).digest('hex');
      const sizeBytes = Buffer.byteLength(testsJson, 'utf8');

      const existingTs = db
        .prepare('SELECT id, sha256 FROM test_sets WHERE problem_id = ? AND version = 1')
        .get(pid) as { id: number; sha256: string } | undefined;
      let tsId: number;
      if (!existingTs) {
        const tsRes = insertTestSet.run(
          pid,
          `problems/${np.slug}/v1/tests.json`,
          tsSha,
          sizeBytes,
          JSON.stringify(manifest),
          testsJson,
          adminId,
          nowIso
        );
        tsId = Number(tsRes.lastInsertRowid);
      } else {
        tsId = Number(existingTs.id);
        if (existingTs.sha256 !== tsSha) {
          updateTestSet.run(tsSha, sizeBytes, JSON.stringify(manifest), testsJson, nowIso, tsId);
        }
      }

      insertNativeDetail.run(
        pid,
        np.statement_md,
        np.input_spec_md,
        np.output_spec_md,
        np.notes_md,
        JSON.stringify(np.samples),
        np.time_limit_ms,
        np.memory_limit_mb,
        np.output_limit_kb,
        np.checker,
        JSON.stringify(np.checker_params || {}),
        tsId
      );

      for (const lCode of np.lessons) {
        const lid = lessonIdByCode.get(lCode);
        if (lid) {
          insertLp.run(
            lid,
            pid,
            np.tier,
            0, // Native problems appear first in lesson tabs
            'approved',
            'strong',
            'Bài tập chấm trực tiếp chính thức của DuckOJ.',
            adminId,
            nowIso
          );
        }
      }
    }

    // 7. Seed 2 sample contests if empty (and keep description copy up to date)
    const weeklyDesc =
      'Kỳ thi luyện tập hàng tuần theo thể thức ICPC (phạt 20 phút cho mỗi lần nộp sai trước khi AC, không tính phạt lỗi biên dịch CE). Gồm 4 bài chấm trực tiếp từ Cấp 0 đến Cấp 2.';
    const springDesc =
      'Kỳ thi thử thách gồm các bài Quy hoạch động, Dijkstra và LCA trên cây. Đề bài sẽ tự động mở khóa đúng thời điểm bắt đầu.';

    const contestCount = (db.prepare('SELECT COUNT(*) AS c FROM contests').get() as { c: number }).c;
    if (contestCount === 0) {
      const activeStart = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const activeEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const upcomingStart = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      const upcomingEnd = new Date(Date.now() + (3 * 24 + 3) * 60 * 60 * 1000).toISOString();

      const c1 = Number(
        db
          .prepare(
            `INSERT INTO contests (slug, title, description_md, start_at, end_at, scoring, penalty_minutes, is_public, created_by)
             VALUES (?, ?, ?, ?, ?, 'icpc', 20, 1, ?)`
          )
          .run(
            'duckoj-weekly-1',
            'DuckOJ Weekly Round #1 — Nhập môn & Cơ bản',
            weeklyDesc,
            activeStart,
            activeEnd,
            adminId
          ).lastInsertRowid
      );

      const c1Slugs: [string, string][] = [
        ['A', 'nat-sum-diff'],
        ['B', 'nat-range-sum-queries'],
        ['C', 'nat-max-activities'],
        ['D', 'nat-cut-ropes'],
      ];
      c1Slugs.forEach(([label, slug], idx) => {
        const pid = problemIdBySlug.get(slug);
        if (pid) {
          db.prepare('INSERT INTO contest_problems (contest_id, problem_id, label, sort_order, points) VALUES (?, ?, ?, ?, 100)').run(
            c1,
            pid,
            label,
            idx + 1
          );
        }
      });

      // Pre-seed participants and sample contest submissions
      db.prepare('INSERT OR IGNORE INTO contest_participants (contest_id, user_id) VALUES (?, ?)').run(c1, rivalId);
      db.prepare('INSERT OR IGNORE INTO contest_participants (contest_id, user_id) VALUES (?, ?)').run(c1, studentId);

      const pA = problemIdBySlug.get('nat-sum-diff')!;
      const pB = problemIdBySlug.get('nat-range-sum-queries')!;
      const subTime1 = new Date(Date.parse(activeStart) + 12 * 60000).toISOString();
      const subTime2 = new Date(Date.parse(activeStart) + 34 * 60000).toISOString();
      const subTime3 = new Date(Date.parse(activeStart) + 45 * 60000).toISOString();

      db.prepare(
        `INSERT INTO submissions (user_id, problem_id, contest_id, language, source_code, status, verdict, score, max_time_ms, max_memory_kb, tests_passed, tests_total, finished_at, submitted_at)
         VALUES (?, ?, ?, 'cpp17', '// sample AC', 'done', 'AC', 100, 14, 14200, 20, 20, ?, ?)`
      ).run(rivalId, pA, c1, subTime1, subTime1);

      db.prepare(
        `INSERT INTO submissions (user_id, problem_id, contest_id, language, source_code, status, verdict, score, max_time_ms, max_memory_kb, tests_passed, tests_total, failed_test, finished_at, submitted_at)
         VALUES (?, ?, ?, 'cpp17', '// sample WA', 'done', 'WA', 0, 16, 14200, 3, 20, '04-overflow', ?, ?)`
      ).run(rivalId, pB, c1, subTime2, subTime2);

      db.prepare(
        `INSERT INTO submissions (user_id, problem_id, contest_id, language, source_code, status, verdict, score, max_time_ms, max_memory_kb, tests_passed, tests_total, finished_at, submitted_at)
         VALUES (?, ?, ?, 'cpp17', '// sample AC', 'done', 'AC', 100, 22, 14800, 20, 20, ?, ?)`
      ).run(rivalId, pB, c1, subTime3, subTime3);

      // Contest 2: Upcoming (hides statements before start_at)
      const c2 = Number(
        db
          .prepare(
            `INSERT INTO contests (slug, title, description_md, start_at, end_at, scoring, penalty_minutes, is_public, created_by)
             VALUES (?, ?, ?, ?, ?, 'icpc', 20, 1, ?)`
          )
          .run(
            'duckoj-cup-spring',
            'DuckOJ Cup Mùa Xuân — Trung cấp & Nâng cao',
            springDesc,
            upcomingStart,
            upcomingEnd,
            adminId
          ).lastInsertRowid
      );
      [
        ['A', 'nat-dice-combinations'],
        ['B', 'nat-dijkstra-path'],
        ['C', 'nat-lca-tree'],
      ].forEach(([label, slug], idx) => {
        const pid = problemIdBySlug.get(slug);
        if (pid) {
          db.prepare('INSERT INTO contest_problems (contest_id, problem_id, label, sort_order, points) VALUES (?, ?, ?, ?, 100)').run(
            c2,
            pid,
            label,
            idx + 1
          );
        }
      });
    } else {
      db.prepare('UPDATE contests SET description_md = ? WHERE slug = ?').run(weeklyDesc, 'duckoj-weekly-1');
      db.prepare('UPDATE contests SET description_md = ? WHERE slug = ?').run(springDesc, 'duckoj-cup-spring');
    }

    // 8. Seed initial sample report so /admin/reports is non-empty
    const repCount = (db.prepare('SELECT COUNT(*) AS c FROM reports').get() as { c: number }).c;
    if (repCount === 0) {
      db.prepare(
        `INSERT INTO reports (user_id, target_type, target_id, message, status)
         VALUES (?, 'lesson', '2.4', 'Gợi ý bổ sung thêm ví dụ minh họa bước thu hẹp biên trong Binary Search.', 'open')`
      ).run(studentId);
    }

    const statsObj = {
      lessonsCount: LESSONS_META.length,
      externalProblemsCount: parsed.problems.length,
      nativeProblemsCount: natives.length,
      lessonProblemLinks: parsed.lessonProblems.length + natives.reduce((a, b) => a + b.lessons.length, 0),
      unmappedLabels: parsed.rawStats.unmappedLabels,
    };

    db.prepare('INSERT INTO seed_runs (git_sha, stats) VALUES (?, ?)').run(
      seedFingerprint,
      JSON.stringify(statsObj)
    );

    db.exec('COMMIT;');
    return { skipped: false, stats: statsObj };
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}
