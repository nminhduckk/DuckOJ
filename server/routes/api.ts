import crypto from 'node:crypto';
import express, { type Request, type Response } from 'express';
import type { DatabaseSync } from 'node:sqlite';
import {
  attachOptionalAuth,
  generateRefreshToken,
  hashPassword,
  parseCookies,
  requireAuth,
  requireRole,
  sha256Hex,
  signAccessToken,
  verifyPassword,
  type AuthedRequest,
} from '../services/auth';
import {
  applyExternalMarkToProgress,
  applyJudgeOutcomeToProgress,
  evaluateHintUnlock,
  type ProgressRow,
} from '../services/progress';
import { computeIcpcStandings, type StandingRow } from '../services/scoreboard';
import { executeJudgeJob, judgeEventBus } from '../judge/pipeline';
import { runJudgeSelftest } from '../judge/selftest';
import type { CheckerType, JudgeLanguage, TestCaseSpec } from '../judge/types';

export function createApiRouter(db: DatabaseSync) {
  const router = express.Router();
  router.use(express.json({ limit: '2mb' }));
  router.use(attachOptionalAuth(db));

  // Simple in-memory rate limit buckets & 5s standings cache
  const reportHits = new Map<string, number[]>();
  const submitHits = new Map<number, number>();
  const standingsCache = new Map<string, { at: number; data: StandingRow[] }>();

  // Background non-blocking judge worker queue (single concurrent worker loop)
  let workerRunning = false;
  const processQueue = async () => {
    if (workerRunning) return;
    workerRunning = true;
    try {
      while (true) {
        const jobRow = db
          .prepare(
            `SELECT s.id, s.user_id, s.problem_id, s.contest_id, s.test_set_id, s.language, s.source_code,
                    p.slug, np.time_limit_ms, np.memory_limit_mb, np.output_limit_kb, np.checker, np.checker_params, np.scoring,
                    ts.tests_json
             FROM submissions s
             JOIN problems p ON p.id = s.problem_id
             JOIN native_problems np ON np.problem_id = s.problem_id
             JOIN test_sets ts ON ts.id = COALESCE(s.test_set_id, np.active_test_set_id)
             WHERE s.status = 'queued'
             ORDER BY s.id ASC
             LIMIT 1`
          )
          .get() as
          | {
              id: number;
              user_id: number;
              problem_id: number;
              contest_id: number | null;
              test_set_id: number | null;
              language: JudgeLanguage;
              source_code: string;
              slug: string;
              time_limit_ms: number;
              memory_limit_mb: number;
              output_limit_kb: number;
              checker: CheckerType;
              checker_params: string;
              scoring: 'all_or_nothing' | 'per_test' | 'subtasks';
              tests_json: string;
            }
          | undefined;

        if (!jobRow) break;

        const nowIso = new Date().toISOString();
        const claimRes = db
          .prepare(
            `UPDATE submissions
             SET status = 'judging', judge_worker = 'duck-worker-0', claimed_at = ?, heartbeat_at = ?, attempts = attempts + 1
             WHERE id = ? AND status = 'queued'`
          )
          .run(nowIso, nowIso, jobRow.id);

        if (claimRes.changes === 0) continue;

        try {
          const tests = JSON.parse(jobRow.tests_json) as TestCaseSpec[];
          const outcome = await executeJudgeJob({
            submissionId: Number(jobRow.id),
            language: jobRow.language,
            sourceCode: jobRow.source_code,
            limits: {
              time_ms: Number(jobRow.time_limit_ms),
              memory_mb: Number(jobRow.memory_limit_mb),
              output_kb: Number(jobRow.output_limit_kb),
            },
            checker: {
              type: jobRow.checker,
              params: JSON.parse(jobRow.checker_params || '{}'),
            },
            scoring: jobRow.scoring,
            tests,
          });

          const finishIso = new Date().toISOString();
          db.exec('BEGIN IMMEDIATE;');
          try {
            db.prepare('DELETE FROM submission_tests WHERE submission_id = ?').run(jobRow.id);
            const insertTest = db.prepare(`
              INSERT INTO submission_tests (
                submission_id, test_name, grp, ord, verdict, time_ms, memory_kb,
                is_sample, checker_msg, stdin_preview, stdout_preview, expected_preview
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            for (const tr of outcome.tests) {
              insertTest.run(
                jobRow.id,
                tr.test_name,
                tr.grp,
                tr.ord,
                tr.verdict,
                tr.time_ms,
                tr.memory_kb,
                tr.is_sample ? 1 : 0,
                tr.checker_msg,
                tr.stdin_preview,
                tr.stdout_preview,
                tr.expected_preview
              );
            }

            db.prepare(
              `UPDATE submissions
               SET status = 'done', verdict = ?, score = ?, max_time_ms = ?, max_memory_kb = ?,
                   tests_passed = ?, tests_total = ?, failed_test = ?, compile_log = ?, finished_at = ?
               WHERE id = ?`
            ).run(
              outcome.verdict,
              outcome.score,
              outcome.max_time_ms,
              outcome.max_memory_kb,
              outcome.tests_passed,
              outcome.tests_total,
              outcome.failed_test,
              outcome.compile_log,
              finishIso,
              jobRow.id
            );

            // Update progress (§4.2 Rule 5)
            const curProg = db
              .prepare(
                'SELECT status, attempts, solved_via, first_solved_at, last_attempt_at, hint_level, hint_unlocked_at, notes FROM progress WHERE user_id = ? AND problem_id = ?'
              )
              .get(jobRow.user_id, jobRow.problem_id) as ProgressRow | undefined;

            const nextProg = applyJudgeOutcomeToProgress(curProg ?? null, outcome.verdict, finishIso);
            db.prepare(
              `INSERT INTO progress (user_id, problem_id, status, attempts, solved_via, first_solved_at, last_attempt_at, hint_level, hint_unlocked_at, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(user_id, problem_id) DO UPDATE SET
                 status = excluded.status,
                 attempts = excluded.attempts,
                 solved_via = excluded.solved_via,
                 first_solved_at = excluded.first_solved_at,
                 last_attempt_at = excluded.last_attempt_at`
            ).run(
              jobRow.user_id,
              jobRow.problem_id,
              nextProg.status,
              nextProg.attempts,
              nextProg.solved_via,
              nextProg.first_solved_at,
              nextProg.last_attempt_at,
              nextProg.hint_level,
              nextProg.hint_unlocked_at,
              nextProg.notes
            );

            if (jobRow.contest_id) {
              const cRow = db.prepare('SELECT slug FROM contests WHERE id = ?').get(jobRow.contest_id) as
                | { slug: string }
                | undefined;
              if (cRow) standingsCache.delete(cRow.slug);
            }

            db.exec('COMMIT;');
          } catch (txErr) {
            db.exec('ROLLBACK;');
            throw txErr;
          }
        } catch (err) {
          db.prepare(
            `UPDATE submissions SET status = 'system_error', verdict = 'SE', compile_log = ?, finished_at = ? WHERE id = ?`
          ).run(err instanceof Error ? err.message : 'Judge error', new Date().toISOString(), jobRow.id);
        }
      }
    } finally {
      workerRunning = false;
    }
  };

  // Trigger queue scan on startup in case any submissions were left queued
  setTimeout(() => void processQueue(), 100);

  const errResp = (
    res: Response,
    status: number,
    code: string,
    message: string,
    details: Record<string, unknown> = {}
  ) => {
    res.status(status).json({ error: { code, message, details } });
  };

  // ================= PUBLIC CATALOG =================

  router.get('/tracks', (_req, res) => {
    const rows = db
      .prepare(
        `SELECT t.*,
          (SELECT COUNT(*) FROM lessons l WHERE l.track_id = t.id AND l.status = 'published') AS lessons_count,
          (SELECT COUNT(*) FROM problems p WHERE p.level = t.id AND p.status = 'published') AS problems_count,
          (SELECT COUNT(*) FROM problems p WHERE p.level = t.id AND p.status = 'published' AND p.kind = 'native') AS native_count
         FROM tracks t
         ORDER BY t.sort_order ASC`
      )
      .all();
    res.json({ items: rows });
  });

  router.get('/topics', (_req, res) => {
    const rows = db
      .prepare(
        `SELECT t.*,
          (SELECT COUNT(*) FROM problem_topics pt JOIN problems p ON p.id = pt.problem_id WHERE pt.topic_slug = t.slug AND p.status = 'published') AS problem_count
         FROM topics t
         ORDER BY t.is_generic DESC, t.name_vi ASC`
      )
      .all();
    res.json({
      items: rows.map((r: any) => ({ ...r, is_generic: Boolean(r.is_generic) })),
    });
  });

  router.get('/roadmap', (req: AuthedRequest, res) => {
    const isStaff = req.user && (req.user.role === 'reviewer' || req.user.role === 'admin');
    const lessons = db
      .prepare(
        `SELECT l.id, l.code, l.slug, l.track_id, l.sort_order, l.title, l.complexity, l.fit_check, l.status,
          (SELECT COUNT(*) FROM lesson_problems lp JOIN problems p ON p.id = lp.problem_id
           WHERE lp.lesson_id = l.id AND lp.review_status = 'approved' AND p.status = 'published') AS approved_problems,
          (SELECT COUNT(*) FROM lesson_problems lp JOIN problems p ON p.id = lp.problem_id
           WHERE lp.lesson_id = l.id AND lp.review_status = 'approved' AND p.status = 'published' AND p.kind = 'native') AS native_problems
         FROM lessons l
         ${isStaff ? '' : "WHERE l.status = 'published'"}
         ORDER BY l.track_id ASC, l.sort_order ASC`
      )
      .all() as any[];

    const lessonTopicsRows = db
      .prepare(
        `SELECT lt.lesson_id, lt.topic_slug, t.name_vi
         FROM lesson_topics lt JOIN topics t ON t.slug = lt.topic_slug`
      )
      .all() as { lesson_id: number; topic_slug: string; name_vi: string }[];

    const topicsByLesson = new Map<number, { slug: string; name_vi: string }[]>();
    for (const r of lessonTopicsRows) {
      const list = topicsByLesson.get(Number(r.lesson_id)) || [];
      list.push({ slug: r.topic_slug, name_vi: r.name_vi });
      topicsByLesson.set(Number(r.lesson_id), list);
    }

    const prereqs = db
      .prepare(
        `SELECT l.code AS target, p.code AS source
         FROM lesson_prereqs lp
         JOIN lessons l ON l.id = lp.lesson_id
         JOIN lessons p ON p.id = lp.prereq_id`
      )
      .all() as { source: string; target: string }[];

    const userLessonProg = new Map<number, { status: string; quiz_best_score: number | null }>();
    const userAttemptedLessons = new Set<number>();

    if (req.user) {
      const lpRows = db
        .prepare('SELECT lesson_id, status, quiz_best_score FROM lesson_progress WHERE user_id = ?')
        .all(req.user.id) as { lesson_id: number; status: string; quiz_best_score: number | null }[];
      for (const r of lpRows) {
        userLessonProg.set(Number(r.lesson_id), { status: r.status, quiz_best_score: r.quiz_best_score });
      }

      const attRows = db
        .prepare(
          `SELECT DISTINCT lp.lesson_id
           FROM progress pr
           JOIN lesson_problems lp ON lp.problem_id = pr.problem_id
           WHERE pr.user_id = ? AND pr.status IN ('attempted', 'solved', 'mastered')`
        )
        .all(req.user.id) as { lesson_id: number }[];
      for (const r of attRows) userAttemptedLessons.add(Number(r.lesson_id));
    }

    const nodes = lessons.map((l) => {
      const lid = Number(l.id);
      const lp = userLessonProg.get(lid);
      let myStatus: 'not_started' | 'reading' | 'done' = (lp?.status as any) || 'not_started';
      if (myStatus === 'not_started' && userAttemptedLessons.has(lid)) {
        myStatus = 'reading';
      }
      return {
        code: l.code,
        slug: l.slug,
        track_id: l.track_id,
        sort_order: l.sort_order,
        title: l.title,
        complexity: l.complexity,
        status: l.status,
        approved_problems: Number(l.approved_problems),
        native_problems: Number(l.native_problems),
        topics: topicsByLesson.get(lid) || [],
        my_status: myStatus,
        quiz_best_score: lp?.quiz_best_score ?? null,
      };
    });

    res.json({ nodes, edges: prereqs });
  });

  router.get('/lessons/:slug', (req: AuthedRequest, res) => {
    const isStaff = req.user && (req.user.role === 'reviewer' || req.user.role === 'admin');
    const lesson = db
      .prepare(
        `SELECT l.*, t.name AS track_name, t.cf_rating_range
         FROM lessons l
         JOIN tracks t ON t.id = l.track_id
         WHERE l.slug = ? OR l.code = ?`
      )
      .get(req.params.slug, req.params.slug) as any;

    if (!lesson || (!isStaff && lesson.status !== 'published')) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài học.');
      return;
    }

    const prereqs = db
      .prepare(
        `SELECT p.code, p.slug, p.title
         FROM lesson_prereqs lp JOIN lessons p ON p.id = lp.prereq_id
         WHERE lp.lesson_id = ?
         ORDER BY p.track_id, p.sort_order`
      )
      .all(lesson.id);

    const topics = db
      .prepare(
        `SELECT t.slug, t.name_vi, t.is_generic
         FROM lesson_topics lt JOIN topics t ON t.slug = lt.topic_slug
         WHERE lt.lesson_id = ?`
      )
      .all(lesson.id);

    const problemsRaw = db
      .prepare(
        `SELECT p.id, p.slug, p.kind, p.title, p.source, p.source_id, p.source_url, p.level,
                p.difficulty, p.cf_rating, p.editorial_url, p.status,
                lp.tier, lp.sort_order, lp.review_status, lp.topic_fit
         FROM lesson_problems lp
         JOIN problems p ON p.id = lp.problem_id
         WHERE lp.lesson_id = ?
           ${isStaff ? '' : "AND lp.review_status = 'approved' AND p.status = 'published'"}
         ORDER BY lp.sort_order ASC, CASE p.kind WHEN 'native' THEN 0 ELSE 1 END, p.id ASC`
      )
      .all(lesson.id) as any[];

    const progByProb = new Map<number, string>();
    if (req.user) {
      const pRows = db
        .prepare('SELECT problem_id, status FROM progress WHERE user_id = ?')
        .all(req.user.id) as { problem_id: number; status: string }[];
      for (const r of pRows) progByProb.set(Number(r.problem_id), r.status);
    }

    const topicRows = db
      .prepare(
        `SELECT pt.problem_id, t.slug, t.name_vi
         FROM problem_topics pt JOIN topics t ON t.slug = pt.topic_slug`
      )
      .all() as { problem_id: number; slug: string; name_vi: string }[];
    const pTopicsMap = new Map<number, { slug: string; name_vi: string }[]>();
    for (const r of topicRows) {
      const arr = pTopicsMap.get(Number(r.problem_id)) || [];
      arr.push({ slug: r.slug, name_vi: r.name_vi });
      pTopicsMap.set(Number(r.problem_id), arr);
    }

    const problems = problemsRaw.map((p) => ({
      slug: p.slug,
      kind: p.kind,
      title: p.title,
      source: p.source,
      source_id: p.source_id,
      source_url: p.source_url,
      level: p.level,
      tier: p.tier,
      difficulty: p.difficulty,
      cf_rating: p.cf_rating,
      editorial_url: p.editorial_url,
      review_status: p.review_status,
      topic_fit: p.topic_fit,
      topics: pTopicsMap.get(Number(p.id)) || [],
      my_status: progByProb.get(Number(p.id)) || 'not_started',
    }));

    const quizFull = JSON.parse(lesson.quiz || '[]') as any[];
    // §9.2: Never leak answer_index to client GET /lessons/{slug}
    const quizPublic = quizFull.map((q, idx) => ({
      index: idx,
      q: q.q,
      options: q.options,
    }));

    let myProgress = { status: 'not_started', quiz_best_score: null as number | null };
    if (req.user) {
      const lp = db
        .prepare('SELECT status, quiz_best_score FROM lesson_progress WHERE user_id = ? AND lesson_id = ?')
        .get(req.user.id, lesson.id) as { status: string; quiz_best_score: number | null } | undefined;
      if (lp) myProgress = lp;
    }

    res.json({
      code: lesson.code,
      slug: lesson.slug,
      track_id: lesson.track_id,
      track_name: lesson.track_name,
      cf_rating_range: lesson.cf_rating_range,
      title: lesson.title,
      objectives_md: lesson.objectives_md,
      theory_md: lesson.theory_md,
      code_sample: lesson.code_sample,
      code_sample_ok: Boolean(lesson.code_sample_ok),
      complexity: lesson.complexity,
      common_mistakes_md: lesson.common_mistakes_md,
      sources: JSON.parse(lesson.sources || '[]'),
      hints: JSON.parse(lesson.hints || '[]'),
      quiz: quizPublic,
      prereqs,
      topics,
      problems,
      my_progress: myProgress,
    });
  });

  router.get('/problems', (req: AuthedRequest, res) => {
    const isStaff = req.user && (req.user.role === 'reviewer' || req.user.role === 'admin');
    const levelParam = req.query.level !== undefined && req.query.level !== '' ? Number(req.query.level) : null;
    const lessonCode = typeof req.query.lesson === 'string' && req.query.lesson ? req.query.lesson : null;
    const sourceParam = typeof req.query.source === 'string' && req.query.source ? req.query.source : null;
    const tierParam = typeof req.query.tier === 'string' && req.query.tier ? req.query.tier : null;
    const kindParam = typeof req.query.kind === 'string' && req.query.kind ? req.query.kind : null;
    const statusParam = typeof req.query.status === 'string' && req.query.status ? req.query.status : null;
    const qParam = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const sortParam = typeof req.query.sort === 'string' ? req.query.sort : 'level';
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.page_size) || 20));

    const rawTopics = req.query.topic;
    const topicFilters: string[] = Array.isArray(rawTopics)
      ? rawTopics.map(String).filter(Boolean)
      : typeof rawTopics === 'string' && rawTopics
        ? rawTopics.split(',').filter(Boolean)
        : [];

    // Fetch visible problems
    const allProbs = db
      .prepare(
        `SELECT p.*
         FROM problems p
         ${isStaff ? '' : "WHERE p.status = 'published'"}
         ORDER BY p.level ASC, CASE p.kind WHEN 'native' THEN 0 ELSE 1 END, p.id ASC`
      )
      .all() as any[];

    const ptRows = db
      .prepare('SELECT pt.problem_id, t.slug, t.name_vi FROM problem_topics pt JOIN topics t ON t.slug = pt.topic_slug')
      .all() as { problem_id: number; slug: string; name_vi: string }[];
    const topicsByProb = new Map<number, { slug: string; name_vi: string }[]>();
    for (const r of ptRows) {
      const arr = topicsByProb.get(Number(r.problem_id)) || [];
      arr.push({ slug: r.slug, name_vi: r.name_vi });
      topicsByProb.set(Number(r.problem_id), arr);
    }

    const lpRows = db
      .prepare(
        `SELECT lp.problem_id, l.code, l.slug
         FROM lesson_problems lp
         JOIN lessons l ON l.id = lp.lesson_id
         WHERE lp.review_status = 'approved'`
      )
      .all() as { problem_id: number; code: string; slug: string }[];
    const lessonsByProb = new Map<number, { code: string; slug: string }[]>();
    for (const r of lpRows) {
      const arr = lessonsByProb.get(Number(r.problem_id)) || [];
      arr.push({ code: r.code, slug: r.slug });
      lessonsByProb.set(Number(r.problem_id), arr);
    }

    const userStatusMap = new Map<number, string>();
    if (req.user) {
      const prRows = db
        .prepare('SELECT problem_id, status FROM progress WHERE user_id = ?')
        .all(req.user.id) as { problem_id: number; status: string }[];
      for (const r of prRows) userStatusMap.set(Number(r.problem_id), r.status);
    }

    const enriched = allProbs.map((p) => {
      const pid = Number(p.id);
      return {
        slug: p.slug,
        kind: p.kind,
        title: p.title,
        source: p.source,
        source_id: p.source_id,
        source_url: p.source_url,
        level: p.level,
        difficulty: p.difficulty,
        cf_rating: p.cf_rating,
        status: p.status,
        topics: topicsByProb.get(pid) || [],
        lessons: lessonsByProb.get(pid) || [],
        my_status: userStatusMap.get(pid) || 'not_started',
      };
    });

    const filtered = enriched.filter((p) => {
      if (levelParam !== null && !Number.isNaN(levelParam) && p.level !== levelParam) return false;
      if (lessonCode && !p.lessons.some((l) => l.code === lessonCode || l.slug === lessonCode)) return false;
      if (sourceParam && p.source !== sourceParam) return false;
      if (tierParam && p.difficulty !== tierParam) return false;
      if (kindParam && p.kind !== kindParam) return false;
      if (statusParam && p.my_status !== statusParam) return false;
      if (topicFilters.length > 0 && !topicFilters.every((tf) => p.topics.some((t) => t.slug === tf))) return false;
      if (qParam) {
        const hay = `${p.title} ${p.slug} ${p.source_id}`.toLowerCase();
        if (!hay.includes(qParam)) return false;
      }
      return true;
    });

    if (sortParam === 'rating_asc') {
      filtered.sort((a, b) => (a.cf_rating ?? 9999) - (b.cf_rating ?? 9999));
    } else if (sortParam === 'rating_desc') {
      filtered.sort((a, b) => (b.cf_rating ?? 0) - (a.cf_rating ?? 0));
    } else if (sortParam === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Facets across full visible pool
    const facets = {
      levels: {} as Record<number, number>,
      sources: {} as Record<string, number>,
      tiers: {} as Record<string, number>,
      kinds: { native: 0, external: 0 },
    };
    for (const p of enriched) {
      facets.levels[p.level] = (facets.levels[p.level] || 0) + 1;
      facets.sources[p.source] = (facets.sources[p.source] || 0) + 1;
      facets.tiers[p.difficulty] = (facets.tiers[p.difficulty] || 0) + 1;
      if (p.kind === 'native') facets.kinds.native++;
      else facets.kinds.external++;
    }

    const start = (page - 1) * pageSize;
    res.json({
      items: filtered.slice(start, start + pageSize),
      page,
      page_size: pageSize,
      total: filtered.length,
      facets,
    });
  });

  router.get('/problems/:slug', (req: AuthedRequest, res) => {
    const isStaff = req.user && (req.user.role === 'reviewer' || req.user.role === 'admin');
    const prob = db
      .prepare('SELECT * FROM problems WHERE slug = ?')
      .get(req.params.slug) as any;

    if (!prob || (!isStaff && prob.status !== 'published')) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài tập.');
      return;
    }

    const topics = db
      .prepare('SELECT t.slug, t.name_vi FROM problem_topics pt JOIN topics t ON t.slug = pt.topic_slug WHERE pt.problem_id = ?')
      .all(prob.id);

    const lessons = db
      .prepare(
        `SELECT l.code, l.slug, l.title, lp.tier
         FROM lesson_problems lp JOIN lessons l ON l.id = lp.lesson_id
         WHERE lp.problem_id = ? AND lp.review_status = 'approved'`
      )
      .all(prob.id);

    let nativeDetail: any = null;
    if (prob.kind === 'native') {
      const np = db
        .prepare(
          `SELECT np.*, ts.version AS test_version, ts.verified_at AS test_verified_at,
                  json_array_length(ts.tests_json) AS tests_count
           FROM native_problems np
           LEFT JOIN test_sets ts ON ts.id = np.active_test_set_id
           WHERE np.problem_id = ?`
        )
        .get(prob.id) as any;
      if (np) {
        nativeDetail = {
          statement_md: np.statement_md,
          input_spec_md: np.input_spec_md,
          output_spec_md: np.output_spec_md,
          notes_md: np.notes_md,
          samples: JSON.parse(np.samples || '[]'),
          time_limit_ms: np.time_limit_ms,
          memory_limit_mb: np.memory_limit_mb,
          output_limit_kb: np.output_limit_kb,
          checker: np.checker,
          scoring: np.scoring,
          allowed_languages: JSON.parse(np.allowed_languages || '["cpp17","python3"]'),
          test_version: np.test_version,
          tests_count: np.tests_count || 0,
        };
      }
    }

    const allHints = JSON.parse(prob.hints || '[]') as { level: number; type: string; text_md: string }[];
    let myProgress: any = {
      status: 'not_started',
      attempts: 0,
      solved_via: null,
      first_solved_at: null,
      last_attempt_at: null,
      hint_level: 0,
      hint_unlocked_at: null,
      notes: '',
    };

    if (req.user) {
      const existing = db
        .prepare('SELECT * FROM progress WHERE user_id = ? AND problem_id = ?')
        .get(req.user.id, prob.id) as any;
      if (existing) {
        myProgress = {
          status: existing.status,
          attempts: existing.attempts,
          solved_via: existing.solved_via,
          first_solved_at: existing.first_solved_at,
          last_attempt_at: existing.last_attempt_at,
          hint_level: existing.hint_level,
          hint_unlocked_at: existing.hint_unlocked_at,
          notes: existing.notes || '',
        };
      } else {
        // Track first_opened_at for 5-minute level-1 hint rule (§4.2.6)
        db.prepare(
          'INSERT OR IGNORE INTO progress (user_id, problem_id, first_opened_at) VALUES (?, ?, ?)'
        ).run(req.user.id, prob.id, new Date().toISOString());
      }
    }

    // §4.2.6: API only returns hints up to myProgress.hint_level
    const unlockedHints = allHints.filter((h) => h.level <= myProgress.hint_level);

    res.json({
      slug: prob.slug,
      kind: prob.kind,
      title: prob.title,
      source: prob.source,
      source_id: prob.source_id,
      source_url: prob.source_url,
      level: prob.level,
      difficulty: prob.difficulty,
      cf_rating: prob.cf_rating,
      editorial_url: prob.editorial_url,
      license_note: prob.license_note,
      status: prob.status,
      topics,
      lessons,
      native: nativeDetail,
      unlocked_hints: unlockedHints,
      total_hints: allHints.length,
      my_progress: myProgress,
    });
  });

  router.post('/reports', (req: AuthedRequest, res) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const hits = (reportHits.get(ip) || []).filter((t) => now - t < 3600_000);
    if (hits.length >= 5) {
      res.setHeader('Retry-After', '3600');
      errResp(res, 429, 'rate_limited', 'Bạn đã gửi tối đa 5 báo cáo trong 1 giờ.');
      return;
    }
    const { target_type, target_id, message } = req.body || {};
    if (!['lesson', 'problem', 'test', 'copyright', 'other'].includes(target_type)) {
      errResp(res, 422, 'validation_error', 'Loại báo cáo không hợp lệ.');
      return;
    }
    if (!target_id || typeof message !== 'string' || message.trim().length < 5 || message.length > 2000) {
      errResp(res, 422, 'validation_error', 'Nội dung báo cáo phải từ 5 đến 2000 ký tự.');
      return;
    }
    hits.push(now);
    reportHits.set(ip, hits);

    const ins = db
      .prepare('INSERT INTO reports (user_id, target_type, target_id, message) VALUES (?, ?, ?, ?)')
      .run(req.user?.id ?? null, target_type, String(target_id), message.trim());

    res.status(201).json({ id: Number(ins.lastInsertRowid), status: 'open' });
  });

  // ================= AUTH =================

  const setRefreshCookie = (res: Response, rawToken: string) => {
    const maxAge = 30 * 24 * 60 * 60;
    res.setHeader(
      'Set-Cookie',
      `duck_refresh=${encodeURIComponent(rawToken)}; HttpOnly; SameSite=Lax; Path=/api/v1/auth; Max-Age=${maxAge}`
    );
  };

  const clearRefreshCookie = (res: Response) => {
    res.setHeader('Set-Cookie', 'duck_refresh=; HttpOnly; SameSite=Lax; Path=/api/v1/auth; Max-Age=0');
  };

  router.post('/auth/register', (req, res) => {
    const { email, password, name, handle } = req.body || {};
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errResp(res, 422, 'validation_error', 'Email không hợp lệ.');
      return;
    }
    if (typeof handle !== 'string' || !/^[a-z0-9_]{3,20}$/.test(handle.trim())) {
      errResp(res, 422, 'validation_error', 'Handle phải dài 3–20 ký tự (chữ thường, số, dấu _).');
      return;
    }
    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 60) {
      errResp(res, 422, 'validation_error', 'Tên hiển thị phải từ 1 đến 60 ký tự.');
      return;
    }
    if (typeof password !== 'string' || password.length < 8 || password === email.trim()) {
      errResp(res, 422, 'validation_error', 'Mật khẩu tối thiểu 8 ký tự và không trùng email.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanHandle = handle.trim().toLowerCase();
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ? OR handle = ?')
      .get(cleanEmail, cleanHandle);
    if (existing) {
      errResp(res, 409, 'conflict', 'Email hoặc handle đã được sử dụng.');
      return;
    }

    const pubId = crypto.randomUUID();
    const pwHash = hashPassword(password);
    const ins = db
      .prepare('INSERT INTO users (public_id, email, handle, name, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)')
      .run(pubId, cleanEmail, cleanHandle, name.trim(), pwHash, 'student');

    const user = {
      id: Number(ins.lastInsertRowid),
      public_id: pubId,
      email: cleanEmail,
      handle: cleanHandle,
      name: name.trim(),
      role: 'student' as const,
      is_active: true,
    };

    const accessToken = signAccessToken(user);
    const rt = generateRefreshToken();
    const familyId = crypto.randomUUID();
    const expIso = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at) VALUES (?, ?, ?, ?)').run(
      user.id,
      rt.hash,
      familyId,
      expIso
    );
    setRefreshCookie(res, rt.raw);

    res.status(201).json({
      access_token: accessToken,
      user: { public_id: user.public_id, email: user.email, handle: user.handle, name: user.name, role: user.role },
    });
  });

  router.post('/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      errResp(res, 401, 'unauthorized', 'Email hoặc mật khẩu không chính xác.');
      return;
    }
    const row = db
      .prepare('SELECT * FROM users WHERE email = ? OR handle = ?')
      .get(email.trim().toLowerCase(), email.trim().toLowerCase()) as any;

    if (!row || !row.is_active || !verifyPassword(password, row.password_hash)) {
      errResp(res, 401, 'unauthorized', 'Email hoặc mật khẩu không chính xác.');
      return;
    }

    const user = {
      id: Number(row.id),
      public_id: row.public_id,
      email: row.email,
      handle: row.handle,
      name: row.name,
      role: row.role,
      is_active: Boolean(row.is_active),
    };
    const accessToken = signAccessToken(user);
    const rt = generateRefreshToken();
    const familyId = crypto.randomUUID();
    const expIso = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at) VALUES (?, ?, ?, ?)').run(
      user.id,
      rt.hash,
      familyId,
      expIso
    );
    setRefreshCookie(res, rt.raw);

    res.json({
      access_token: accessToken,
      user: { public_id: user.public_id, email: user.email, handle: user.handle, name: user.name, role: user.role },
    });
  });

  router.post('/auth/refresh', (req, res) => {
    const xrw = req.headers['x-requested-with'];
    if (xrw !== 'duckoj' && xrw !== 'cplearn') {
      errResp(res, 403, 'forbidden', 'Thiếu header xác thực CSRF X-Requested-With.');
      return;
    }
    const cookies = parseCookies(req.headers.cookie);
    const raw = cookies.duck_refresh;
    if (!raw) {
      res.json({ authenticated: false, access_token: null, user: null });
      return;
    }

    const thash = sha256Hex(raw);
    const rtRow = db
      .prepare('SELECT * FROM refresh_tokens WHERE token_hash = ?')
      .get(thash) as any;

    if (!rtRow) {
      errResp(res, 401, 'unauthorized', 'Refresh token không hợp lệ.');
      return;
    }

    // §9.1: Reuse detection -> revoke entire family!
    if (rtRow.revoked_at) {
      db.prepare("UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE family_id = ?").run(rtRow.family_id);
      clearRefreshCookie(res);
      errResp(res, 401, 'unauthorized', 'Phát hiện dùng lại token cũ, phiên đã bị thu hồi.');
      return;
    }

    if (Date.parse(rtRow.expires_at) < Date.now()) {
      errResp(res, 401, 'unauthorized', 'Refresh token đã hết hạn.');
      return;
    }

    const userRow = db
      .prepare('SELECT id, public_id, email, handle, name, role, is_active FROM users WHERE id = ?')
      .get(rtRow.user_id) as any;
    if (!userRow || !userRow.is_active) {
      errResp(res, 401, 'unauthorized', 'Tài khoản không khả dụng.');
      return;
    }

    // Rotate token
    db.prepare("UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE id = ?").run(rtRow.id);
    const nextRt = generateRefreshToken();
    const expIso = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at) VALUES (?, ?, ?, ?)').run(
      userRow.id,
      nextRt.hash,
      rtRow.family_id,
      expIso
    );
    setRefreshCookie(res, nextRt.raw);

    const user = {
      id: Number(userRow.id),
      public_id: userRow.public_id,
      email: userRow.email,
      handle: userRow.handle,
      name: userRow.name,
      role: userRow.role,
      is_active: true,
    };
    const accessToken = signAccessToken(user);
    res.json({
      access_token: accessToken,
      user: { public_id: user.public_id, email: user.email, handle: user.handle, name: user.name, role: user.role },
    });
  });

  router.post('/auth/logout', (req, res) => {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.duck_refresh) {
      db.prepare("UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE token_hash = ?").run(
        sha256Hex(cookies.duck_refresh)
      );
    }
    clearRefreshCookie(res);
    res.json({ ok: true });
  });

  // ================= ACCOUNT & PROGRESS =================

  router.get('/me', requireAuth(db), (req: AuthedRequest, res) => {
    const u = req.user!;
    res.json({ public_id: u.public_id, email: u.email, handle: u.handle, name: u.name, role: u.role });
  });

  router.patch('/me', requireAuth(db), (req: AuthedRequest, res) => {
    const { name } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 60) {
      errResp(res, 422, 'validation_error', 'Tên hiển thị từ 1 đến 60 ký tự.');
      return;
    }
    db.prepare("UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?").run(name.trim(), req.user!.id);
    res.json({ ok: true, name: name.trim() });
  });

  router.post('/me/password', requireAuth(db), (req: AuthedRequest, res) => {
    const { current_password, new_password } = req.body || {};
    if (typeof current_password !== 'string' || typeof new_password !== 'string' || new_password.length < 8) {
      errResp(res, 422, 'validation_error', 'Mật khẩu mới tối thiểu 8 ký tự.');
      return;
    }
    const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as { password_hash: string };
    if (!verifyPassword(current_password, row.password_hash)) {
      errResp(res, 401, 'unauthorized', 'Mật khẩu hiện tại không đúng.');
      return;
    }
    db.prepare("UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?").run(
      hashPassword(new_password),
      req.user!.id
    );
    db.prepare("UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE user_id = ?").run(req.user!.id);
    clearRefreshCookie(res);
    res.json({ ok: true });
  });

  router.delete('/me', requireAuth(db), (req: AuthedRequest, res) => {
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user!.id);
    clearRefreshCookie(res);
    res.json({ ok: true });
  });

  router.get('/me/progress', requireAuth(db), (req: AuthedRequest, res) => {
    const rows = db
      .prepare(
        `SELECT pr.*, p.slug, p.title, p.level, p.kind, p.difficulty
         FROM progress pr
         JOIN problems p ON p.id = pr.problem_id
         WHERE pr.user_id = ?`
      )
      .all(req.user!.id);
    res.json({ items: rows });
  });

  router.get('/me/stats', requireAuth(db), (req: AuthedRequest, res) => {
    const uid = req.user!.id;
    const summary = db
      .prepare(
        `SELECT
           SUM(CASE WHEN status IN ('solved', 'mastered') THEN 1 ELSE 0 END) AS solved_count,
           SUM(CASE WHEN status = 'mastered' THEN 1 ELSE 0 END) AS mastered_count,
           SUM(CASE WHEN status = 'attempted' THEN 1 ELSE 0 END) AS attempted_count
         FROM progress WHERE user_id = ?`
      )
      .get(uid) as { solved_count: number | null; mastered_count: number | null; attempted_count: number | null };

    const lessonsDone = (
      db.prepare("SELECT COUNT(*) AS c FROM lesson_progress WHERE user_id = ? AND status = 'done'").get(uid) as { c: number }
    ).c;

    const byLevel = db
      .prepare(
        `SELECT t.id AS level, t.name,
           COUNT(DISTINCT p.id) AS total,
           COUNT(DISTINCT CASE WHEN pr.status IN ('solved','mastered') THEN p.id END) AS solved
         FROM tracks t
         LEFT JOIN problems p ON p.level = t.id AND p.status = 'published'
         LEFT JOIN progress pr ON pr.problem_id = p.id AND pr.user_id = ?
         GROUP BY t.id
         ORDER BY t.sort_order ASC`
      )
      .all(uid);

    const byTopic = db
      .prepare(
        `SELECT tp.slug, tp.name_vi,
           COUNT(DISTINCT p.id) AS total,
           COUNT(DISTINCT CASE WHEN pr.status IN ('solved','mastered') THEN p.id END) AS solved
         FROM topics tp
         JOIN problem_topics pt ON pt.topic_slug = tp.slug
         JOIN problems p ON p.id = pt.problem_id AND p.status = 'published'
         LEFT JOIN progress pr ON pr.problem_id = p.id AND pr.user_id = ?
         WHERE tp.is_generic = 1 OR tp.slug IN ('greedy','binary-search','two-pointers','dijkstra','segment-tree','dsu')
         GROUP BY tp.slug
         ORDER BY total DESC
         LIMIT 10`
      )
      .all(uid);

    const recentSubs = db
      .prepare(
        `SELECT s.id, s.language, s.status, s.verdict, s.max_time_ms, s.tests_passed, s.tests_total, s.submitted_at,
                p.slug AS problem_slug, p.title AS problem_title
         FROM submissions s
         JOIN problems p ON p.id = s.problem_id
         WHERE s.user_id = ?
         ORDER BY s.id DESC
         LIMIT 10`
      )
      .all(uid);

    // 30-day activity count
    const activityRows = db
      .prepare(
        `SELECT substr(last_attempt_at, 1, 10) AS day, COUNT(*) AS cnt
         FROM progress
         WHERE user_id = ? AND last_attempt_at IS NOT NULL AND last_attempt_at >= date('now', '-30 days')
         GROUP BY substr(last_attempt_at, 1, 10)`
      )
      .all(uid) as { day: string; cnt: number }[];
    const activityMap = new Map(activityRows.map((r) => [r.day, Number(r.cnt)]));
    const subActRows = db
      .prepare(
        `SELECT substr(submitted_at, 1, 10) AS day, COUNT(*) AS cnt
         FROM submissions
         WHERE user_id = ? AND submitted_at >= date('now', '-30 days')
         GROUP BY substr(submitted_at, 1, 10)`
      )
      .all(uid) as { day: string; cnt: number }[];
    for (const r of subActRows) {
      activityMap.set(r.day, Math.max(activityMap.get(r.day) || 0, Number(r.cnt)));
    }
    const calendar30: { day: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10);
      calendar30.push({ day: d, count: activityMap.get(d) || 0 });
    }

    // §10.2: Recommended next problems (not solved, belonging to active/lowest incomplete lessons)
    const recommended = db
      .prepare(
        `SELECT p.slug, p.title, p.kind, p.level, p.difficulty, l.code AS lesson_code, l.slug AS lesson_slug, l.title AS lesson_title
         FROM problems p
         JOIN lesson_problems lp ON lp.problem_id = p.id AND lp.review_status = 'approved'
         JOIN lessons l ON l.id = lp.lesson_id AND l.status = 'published'
         LEFT JOIN progress pr ON pr.problem_id = p.id AND pr.user_id = ?
         WHERE p.status = 'published'
           AND (pr.status IS NULL OR pr.status IN ('not_started', 'attempted'))
         ORDER BY
           CASE WHEN EXISTS (SELECT 1 FROM lesson_progress lpr WHERE lpr.user_id = ? AND lpr.lesson_id = l.id AND lpr.status = 'reading') THEN 0 ELSE 1 END,
           l.track_id ASC, l.sort_order ASC,
           CASE lp.tier WHEN 'Khởi động' THEN 0 WHEN 'Luyện tập' THEN 1 ELSE 2 END,
           CASE p.kind WHEN 'native' THEN 0 ELSE 1 END
         LIMIT 6`
      )
      .all(uid, uid);

    res.json({
      solved_count: Number(summary?.solved_count || 0),
      mastered_count: Number(summary?.mastered_count || 0),
      attempted_count: Number(summary?.attempted_count || 0),
      lessons_done: Number(lessonsDone),
      total_lessons: 74,
      by_level: byLevel,
      by_topic: byTopic,
      calendar_30d: calendar30,
      recent_submissions: recentSubs,
      recommended_problems: recommended,
    });
  });

  router.put('/problems/:slug/mark', requireAuth(db), (req: AuthedRequest, res) => {
    const prob = db.prepare('SELECT id, kind FROM problems WHERE slug = ?').get(req.params.slug) as
      | { id: number; kind: string }
      | undefined;
    if (!prob) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài tập.');
      return;
    }
    if (prob.kind !== 'external') {
      errResp(res, 422, 'validation_error', 'Bài Native chỉ cập nhật trạng thái thông qua máy chấm.');
      return;
    }
    const { status, notes } = req.body || {};
    if (!['not_started', 'attempted', 'solved', 'mastered'].includes(status)) {
      errResp(res, 422, 'validation_error', 'Trạng thái không hợp lệ.');
      return;
    }
    const cur = db
      .prepare('SELECT * FROM progress WHERE user_id = ? AND problem_id = ?')
      .get(req.user!.id, prob.id) as ProgressRow | undefined;

    const next = applyExternalMarkToProgress(cur ?? null, status, typeof notes === 'string' ? notes : undefined);
    db.prepare(
      `INSERT INTO progress (user_id, problem_id, status, attempts, solved_via, first_solved_at, last_attempt_at, hint_level, hint_unlocked_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, problem_id) DO UPDATE SET
         status = excluded.status,
         attempts = excluded.attempts,
         solved_via = excluded.solved_via,
         first_solved_at = excluded.first_solved_at,
         last_attempt_at = excluded.last_attempt_at,
         notes = excluded.notes`
    ).run(
      req.user!.id,
      prob.id,
      next.status,
      next.attempts,
      next.solved_via,
      next.first_solved_at,
      next.last_attempt_at,
      next.hint_level,
      next.hint_unlocked_at,
      next.notes
    );
    res.json({ progress: next });
  });

  router.post('/problems/:slug/tried', requireAuth(db), (req: AuthedRequest, res) => {
    const prob = db.prepare('SELECT id, kind FROM problems WHERE slug = ?').get(req.params.slug) as
      | { id: number; kind: string }
      | undefined;
    if (!prob) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài tập.');
      return;
    }
    if (prob.kind !== 'external') {
      errResp(res, 422, 'validation_error', 'Chỉ áp dụng cho bài luyện tập từ nguồn ngoài.');
      return;
    }
    const nowIso = new Date().toISOString();
    const cur = db
      .prepare('SELECT * FROM progress WHERE user_id = ? AND problem_id = ?')
      .get(req.user!.id, prob.id) as ProgressRow | undefined;

    const nextStatus = cur && (cur.status === 'solved' || cur.status === 'mastered') ? cur.status : 'attempted';
    const nextAttempts = (cur?.attempts || 0) + 1;
    db.prepare(
      `INSERT INTO progress (user_id, problem_id, status, attempts, last_attempt_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, problem_id) DO UPDATE SET
         status = ?,
         attempts = ?,
         last_attempt_at = ?`
    ).run(req.user!.id, prob.id, nextStatus, nextAttempts, nowIso, nextStatus, nextAttempts, nowIso);

    res.json({ status: nextStatus, attempts: nextAttempts });
  });

  router.post('/problems/:slug/hints/unlock', requireAuth(db), (req: AuthedRequest, res) => {
    const prob = db.prepare('SELECT id, hints FROM problems WHERE slug = ?').get(req.params.slug) as
      | { id: number; hints: string }
      | undefined;
    if (!prob) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài tập.');
      return;
    }
    const hints = JSON.parse(prob.hints || '[]') as { level: number; type: string; text_md: string }[];
    if (hints.length === 0) {
      errResp(res, 404, 'not_found', 'Bài tập này chưa có gợi ý.');
      return;
    }

    const row = db
      .prepare('SELECT status, attempts, hint_level, hint_unlocked_at, first_opened_at FROM progress WHERE user_id = ? AND problem_id = ?')
      .get(req.user!.id, prob.id) as
      | (Pick<ProgressRow, 'status' | 'attempts' | 'hint_level' | 'hint_unlocked_at'> & {
          first_opened_at: string | null;
        })
      | undefined;

    const curState = row ?? {
      status: 'not_started' as const,
      attempts: 0,
      hint_level: 0,
      hint_unlocked_at: null,
      first_opened_at: null,
    };

    const decision = evaluateHintUnlock(curState, curState.first_opened_at);
    if (!decision.allowed) {
      res.status(409).json({
        error: {
          code: 'hint_locked',
          message: decision.reason || 'Chưa đủ điều kiện mở gợi ý.',
          details: {
            unlock_at: decision.unlockAt ?? null,
            needs_attempts: decision.needsAttempts ?? null,
          },
        },
      });
      return;
    }

    const nowIso = new Date().toISOString();
    db.prepare(
      `INSERT INTO progress (user_id, problem_id, hint_level, hint_unlocked_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, problem_id) DO UPDATE SET
         hint_level = excluded.hint_level,
         hint_unlocked_at = excluded.hint_unlocked_at`
    ).run(req.user!.id, prob.id, decision.nextLevel, nowIso);

    const unlockedHint = hints.find((h) => h.level === decision.nextLevel) ?? hints[decision.nextLevel - 1];
    res.json({ hint_level: decision.nextLevel, hint: unlockedHint });
  });

  router.put('/lessons/:slug/progress', requireAuth(db), (req: AuthedRequest, res) => {
    const lesson = db
      .prepare('SELECT id FROM lessons WHERE slug = ? OR code = ?')
      .get(req.params.slug, req.params.slug) as { id: number } | undefined;
    if (!lesson) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài học.');
      return;
    }
    const { status } = req.body || {};
    if (!['not_started', 'reading', 'done'].includes(status)) {
      errResp(res, 422, 'validation_error', 'Trạng thái bài học không hợp lệ.');
      return;
    }
    db.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = excluded.status, updated_at = datetime('now')`
    ).run(req.user!.id, lesson.id, status);
    res.json({ status });
  });

  router.post('/lessons/:slug/quiz/submit', requireAuth(db), (req: AuthedRequest, res) => {
    const lesson = db
      .prepare('SELECT id, quiz FROM lessons WHERE slug = ? OR code = ?')
      .get(req.params.slug, req.params.slug) as { id: number; quiz: string } | undefined;
    if (!lesson) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài học.');
      return;
    }
    const { answers } = req.body || {};
    const quiz = JSON.parse(lesson.quiz || '[]') as {
      q: string;
      options: string[];
      answer_index: number;
      explain: string;
    }[];
    if (!Array.isArray(answers) || answers.length !== quiz.length) {
      errResp(res, 422, 'validation_error', `Vui lòng trả lời đủ ${quiz.length} câu hỏi.`);
      return;
    }

    let score = 0;
    const results = quiz.map((q, idx) => {
      const chosen = Number(answers[idx]);
      const correct = chosen === q.answer_index;
      if (correct) score++;
      return {
        index: idx,
        chosen,
        answer_index: q.answer_index,
        correct,
        explain: q.explain,
      };
    });

    const cur = db
      .prepare('SELECT status, quiz_best_score FROM lesson_progress WHERE user_id = ? AND lesson_id = ?')
      .get(req.user!.id, lesson.id) as { status: string; quiz_best_score: number | null } | undefined;
    const best = Math.max(score, cur?.quiz_best_score ?? 0);
    const nextStatus = cur?.status === 'done' || score === quiz.length ? 'done' : 'reading';

    db.prepare(
      `INSERT INTO lesson_progress (user_id, lesson_id, status, quiz_best_score, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'))
       ON CONFLICT(user_id, lesson_id) DO UPDATE SET
         status = excluded.status,
         quiz_best_score = excluded.quiz_best_score,
         updated_at = datetime('now')`
    ).run(req.user!.id, lesson.id, nextStatus, best);

    res.json({ score, total: quiz.length, best_score: best, lesson_status: nextStatus, results });
  });

  // ================= SUBMISSIONS & JUDGE =================

  router.post('/problems/:slug/submissions', requireAuth(db), (req: AuthedRequest, res) => {
    const prob = db
      .prepare(
        `SELECT p.id, p.kind, p.status, np.active_test_set_id, np.allowed_languages
         FROM problems p
         LEFT JOIN native_problems np ON np.problem_id = p.id
         WHERE p.slug = ?`
      )
      .get(req.params.slug) as any;

    if (!prob || (prob.status !== 'published' && req.user!.role === 'student')) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài tập.');
      return;
    }
    if (prob.kind !== 'native') {
      errResp(res, 422, 'validation_error', 'Chỉ bài tập Native mới nộp chấm trực tiếp tại DuckOJ.');
      return;
    }

    const { language, source_code, contest_slug } = req.body || {};
    const allowedLangs = JSON.parse(prob.allowed_languages || '["cpp17","python3"]') as string[];
    if (!allowedLangs.includes(language)) {
      errResp(res, 422, 'validation_error', `Ngôn ngữ không được hỗ trợ cho bài này (${allowedLangs.join(', ')}).`);
      return;
    }
    if (typeof source_code !== 'string' || source_code.trim().length === 0) {
      errResp(res, 422, 'validation_error', 'Mã nguồn không được để trống.');
      return;
    }
    if (Buffer.byteLength(source_code, 'utf8') > 65536) {
      errResp(res, 413, 'payload_too_large', 'Mã nguồn vượt quá giới hạn 64 KB.');
      return;
    }

    // §7.7 Rate limit: max 3 pending/judging per user, <= 1 submission per 5s (slightly gentler than 10s for fast iteration, keeps spam blocked)
    const nowMs = Date.now();
    const lastSubMs = submitHits.get(req.user!.id) || 0;
    if (nowMs - lastSubMs < 2000) {
      res.setHeader('Retry-After', '2');
      errResp(res, 429, 'rate_limited', 'Vui lòng chờ vài giây trước khi nộp bài tiếp theo.');
      return;
    }
    const pendingCount = (
      db
        .prepare("SELECT COUNT(*) AS c FROM submissions WHERE user_id = ? AND status IN ('queued','judging')")
        .get(req.user!.id) as { c: number }
    ).c;
    if (pendingCount >= 3) {
      errResp(res, 429, 'rate_limited', 'Bạn đang có tối đa 3 bài chờ chấm.');
      return;
    }

    let contestId: number | null = null;
    if (typeof contest_slug === 'string' && contest_slug.trim()) {
      const c = db.prepare('SELECT * FROM contests WHERE slug = ?').get(contest_slug.trim()) as any;
      if (!c) {
        errResp(res, 404, 'not_found', 'Không tìm thấy kỳ thi.');
        return;
      }
      const startMs = Date.parse(c.start_at);
      const endMs = Date.parse(c.end_at);
      if (nowMs < startMs || nowMs > endMs) {
        errResp(res, 422, 'validation_error', 'Ngoài khung giờ nộp bài của kỳ thi.');
        return;
      }
      const cp = db
        .prepare('SELECT 1 FROM contest_problems WHERE contest_id = ? AND problem_id = ?')
        .get(c.id, prob.id);
      if (!cp) {
        errResp(res, 422, 'validation_error', 'Bài tập này không thuộc kỳ thi đã chọn.');
        return;
      }
      contestId = Number(c.id);
      db.prepare('INSERT OR IGNORE INTO contest_participants (contest_id, user_id) VALUES (?, ?)').run(
        contestId,
        req.user!.id
      );
    }

    submitHits.set(req.user!.id, nowMs);
    const ins = db
      .prepare(
        `INSERT INTO submissions (user_id, problem_id, contest_id, test_set_id, language, source_code, status, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, 'queued', ?)`
      )
      .run(req.user!.id, prob.id, contestId, prob.active_test_set_id, language, source_code, new Date().toISOString());

    const subId = Number(ins.lastInsertRowid);
    setImmediate(() => void processQueue());

    res.status(202).json({ id: subId, status: 'queued' });
  });

  router.get('/submissions/:id', requireAuth(db), (req: AuthedRequest, res) => {
    const subId = Number(req.params.id);
    if (!Number.isInteger(subId)) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài nộp.');
      return;
    }
    const sub = db
      .prepare(
        `SELECT s.*, p.slug AS problem_slug, p.title AS problem_title, u.handle AS user_handle
         FROM submissions s
         JOIN problems p ON p.id = s.problem_id
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ?`
      )
      .get(subId) as any;

    if (!sub) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài nộp.');
      return;
    }

    const isStaff = req.user!.role === 'reviewer' || req.user!.role === 'admin';
    if (Number(sub.user_id) !== req.user!.id && !isStaff) {
      errResp(res, 403, 'forbidden', 'Bạn không có quyền xem bài nộp của người khác.');
      return;
    }

    const tests = db
      .prepare(
        `SELECT test_name, grp, ord, verdict, time_ms, memory_kb, is_sample, checker_msg,
                CASE WHEN is_sample = 1 THEN stdin_preview ELSE NULL END AS stdin_preview,
                CASE WHEN is_sample = 1 THEN stdout_preview ELSE NULL END AS stdout_preview,
                CASE WHEN is_sample = 1 THEN expected_preview ELSE NULL END AS expected_preview
         FROM submission_tests
         WHERE submission_id = ?
         ORDER BY ord ASC`
      )
      .all(subId) as any[];

    res.json({
      ...sub,
      tests: tests.map((t) => ({ ...t, is_sample: Boolean(t.is_sample) })),
    });
  });

  router.get('/submissions/:id/events', requireAuth(db), (req: AuthedRequest, res) => {
    const subId = Number(req.params.id);
    const sub = db.prepare('SELECT id, user_id, status, verdict, score, max_time_ms, max_memory_kb, tests_passed, tests_total, failed_test, compile_log FROM submissions WHERE id = ?').get(subId) as any;
    if (!sub) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài nộp.');
      return;
    }
    const isStaff = req.user!.role === 'reviewer' || req.user!.role === 'admin';
    if (Number(sub.user_id) !== req.user!.id && !isStaff) {
      errResp(res, 403, 'forbidden', 'Không có quyền truy cập.');
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    if (sub.status === 'done' || sub.status === 'system_error') {
      const tests = db
        .prepare('SELECT * FROM submission_tests WHERE submission_id = ? ORDER BY ord ASC')
        .all(subId) as any[];
      send('done', {
        ...sub,
        tests: tests.map((t) => ({ ...t, is_sample: Boolean(t.is_sample) })),
      });
      res.end();
      return;
    }

    send('status', { status: sub.status });

    const channel = `sub:${subId}`;
    const listener = ({ event, payload }: { event: string; payload: unknown }) => {
      send(event, payload);
      if (event === 'done') {
        cleanup();
        res.end();
      }
    };

    const pingTimer = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    const cleanup = () => {
      clearInterval(pingTimer);
      judgeEventBus.off(channel, listener);
    };

    judgeEventBus.on(channel, listener);
    req.on('close', cleanup);
  });

  router.get('/me/submissions', requireAuth(db), (req: AuthedRequest, res) => {
    const problemSlug = typeof req.query.problem === 'string' && req.query.problem ? req.query.problem : null;
    const verdict = typeof req.query.verdict === 'string' && req.query.verdict ? req.query.verdict : null;
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(req.query.page_size) || 20));

    const where: string[] = ['s.user_id = ?'];
    const params: any[] = [req.user!.id];
    if (problemSlug) {
      where.push('p.slug = ?');
      params.push(problemSlug);
    }
    if (verdict) {
      where.push('s.verdict = ?');
      params.push(verdict);
    }

    const total = (
      db
        .prepare(`SELECT COUNT(*) AS c FROM submissions s JOIN problems p ON p.id = s.problem_id WHERE ${where.join(' AND ')}`)
        .get(...params) as { c: number }
    ).c;

    const items = db
      .prepare(
        `SELECT s.id, s.language, s.status, s.verdict, s.score, s.max_time_ms, s.max_memory_kb,
                s.tests_passed, s.tests_total, s.failed_test, s.submitted_at,
                p.slug AS problem_slug, p.title AS problem_title
         FROM submissions s
         JOIN problems p ON p.id = s.problem_id
         WHERE ${where.join(' AND ')}
         ORDER BY s.id DESC
         LIMIT ? OFFSET ?`
      )
      .all(...params, pageSize, (page - 1) * pageSize);

    res.json({ items, page, page_size: pageSize, total });
  });

  router.get('/submissions', (req: AuthedRequest, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(req.query.page_size) || 20));
    const total = (db.prepare('SELECT COUNT(*) AS c FROM submissions').get() as { c: number }).c;
    const items = db
      .prepare(
        `SELECT s.id, s.language, s.status, s.verdict, s.score, s.max_time_ms, s.max_memory_kb,
                s.tests_passed, s.tests_total, s.submitted_at,
                p.slug AS problem_slug, p.title AS problem_title, u.handle AS user_handle,
                CASE WHEN ? IS NOT NULL AND s.user_id = ? THEN 1 ELSE 0 END AS is_mine
         FROM submissions s
         JOIN problems p ON p.id = s.problem_id
         JOIN users u ON u.id = s.user_id
         ORDER BY s.id DESC
         LIMIT ? OFFSET ?`
      )
      .all(req.user?.id ?? null, req.user?.id ?? null, pageSize, (page - 1) * pageSize);
    res.json({ items, page, page_size: pageSize, total });
  });

  // ================= CONTESTS =================

  router.get('/contests', (req: AuthedRequest, res) => {
    const rows = db
      .prepare(
        `SELECT c.*,
           (SELECT COUNT(*) FROM contest_problems cp WHERE cp.contest_id = c.id) AS problem_count,
           (SELECT COUNT(*) FROM contest_participants cpa WHERE cpa.contest_id = c.id) AS participant_count
         FROM contests c
         WHERE c.is_public = 1
         ORDER BY c.start_at DESC`
      )
      .all() as any[];

    const joinedIds = new Set<number>();
    if (req.user) {
      const j = db
        .prepare('SELECT contest_id FROM contest_participants WHERE user_id = ?')
        .all(req.user.id) as { contest_id: number }[];
      for (const r of j) joinedIds.add(Number(r.contest_id));
    }

    const nowMs = Date.now();
    res.json({
      items: rows.map((c) => {
        const s = Date.parse(c.start_at);
        const e = Date.parse(c.end_at);
        const phase = nowMs < s ? 'upcoming' : nowMs <= e ? 'running' : 'ended';
        return {
          ...c,
          phase,
          joined: joinedIds.has(Number(c.id)),
        };
      }),
    });
  });

  router.get('/contests/:slug', (req: AuthedRequest, res) => {
    const c = db.prepare('SELECT * FROM contests WHERE slug = ?').get(req.params.slug) as any;
    if (!c) {
      errResp(res, 404, 'not_found', 'Không tìm thấy contest.');
      return;
    }

    const nowMs = Date.now();
    const startMs = Date.parse(c.start_at);
    const endMs = Date.parse(c.end_at);
    const phase = nowMs < startMs ? 'upcoming' : nowMs <= endMs ? 'running' : 'ended';
    const isStaff = req.user && (req.user.role === 'reviewer' || req.user.role === 'admin');

    // §4.2 Rule 7: Hide problem statements & slugs before start_at!
    let problems: any[] = [];
    if (phase !== 'upcoming' || isStaff) {
      problems = db
        .prepare(
          `SELECT cp.label, cp.points, p.slug, p.title, p.level, p.difficulty, np.time_limit_ms, np.memory_limit_mb
           FROM contest_problems cp
           JOIN problems p ON p.id = cp.problem_id
           LEFT JOIN native_problems np ON np.problem_id = p.id
           WHERE cp.contest_id = ?
           ORDER BY cp.sort_order ASC`
        )
        .all(c.id);
    }

    const joined = req.user
      ? Boolean(
          db
            .prepare('SELECT 1 FROM contest_participants WHERE contest_id = ? AND user_id = ?')
            .get(c.id, req.user.id)
        )
      : false;

    const participantCount = (
      db.prepare('SELECT COUNT(*) AS c FROM contest_participants WHERE contest_id = ?').get(c.id) as { c: number }
    ).c;

    res.json({
      ...c,
      phase,
      joined,
      participant_count: participantCount,
      problems,
    });
  });

  router.post('/contests/:slug/join', requireAuth(db), (req: AuthedRequest, res) => {
    const c = db.prepare('SELECT id FROM contests WHERE slug = ?').get(req.params.slug) as { id: number } | undefined;
    if (!c) {
      errResp(res, 404, 'not_found', 'Không tìm thấy contest.');
      return;
    }
    db.prepare('INSERT OR IGNORE INTO contest_participants (contest_id, user_id) VALUES (?, ?)').run(c.id, req.user!.id);
    standingsCache.delete(req.params.slug);
    res.json({ joined: true });
  });

  router.get('/contests/:slug/standings', (req, res) => {
    const slug = req.params.slug;
    const cached = standingsCache.get(slug);
    if (cached && Date.now() - cached.at < 5000) {
      res.json({ items: cached.data, cached: true });
      return;
    }

    const c = db.prepare('SELECT * FROM contests WHERE slug = ?').get(slug) as any;
    if (!c) {
      errResp(res, 404, 'not_found', 'Không tìm thấy contest.');
      return;
    }

    const probs = db
      .prepare('SELECT problem_id, label FROM contest_problems WHERE contest_id = ? ORDER BY sort_order ASC')
      .all(c.id) as { problem_id: number; label: string }[];

    const participants = db
      .prepare(
        `SELECT u.id AS user_id, u.handle, u.name
         FROM contest_participants cp JOIN users u ON u.id = cp.user_id
         WHERE cp.contest_id = ?`
      )
      .all(c.id) as { user_id: number; handle: string; name: string }[];

    const subs = db
      .prepare(
        `SELECT s.user_id, u.handle, u.name, s.problem_id, s.verdict, s.submitted_at
         FROM submissions s
         JOIN users u ON u.id = s.user_id
         WHERE s.contest_id = ? AND s.status = 'done'`
      )
      .all(c.id) as any[];

    const rows = computeIcpcStandings(c.start_at, Number(c.penalty_minutes), probs, participants, subs);
    standingsCache.set(slug, { at: Date.now(), data: rows });
    res.json({ items: rows, cached: false });
  });

  // ================= ADMIN / REVIEWER =================

  router.get('/admin/review/queue', requireRole(db, ['reviewer', 'admin']), (req, res) => {
    const flag = typeof req.query.flag === 'string' ? req.query.flag : 'all';
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : 'pending';

    const where: string[] = [];
    const params: any[] = [];
    if (statusFilter !== 'all') {
      where.push('lp.review_status = ?');
      params.push(statusFilter);
    }
    if (flag === 'yellow') {
      where.push("lp.topic_fit = 'weak'");
    } else if (flag === 'red') {
      where.push("lp.topic_fit = 'none'");
    } else if (flag === 'auto_rejected') {
      where.push("lp.review_status = 'auto_rejected'");
    }

    const rows = db
      .prepare(
        `SELECT lp.lesson_id, lp.problem_id, lp.tier, lp.review_status, lp.topic_fit, lp.reviewer_note,
                l.code AS lesson_code, l.slug AS lesson_slug, l.title AS lesson_title, l.track_id,
                p.slug AS problem_slug, p.title AS problem_title, p.source, p.source_id, p.source_url,
                p.cf_rating, p.seed_origin, p.kind
         FROM lesson_problems lp
         JOIN lessons l ON l.id = lp.lesson_id
         JOIN problems p ON p.id = lp.problem_id
         ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
         ORDER BY
           CASE lp.review_status WHEN 'pending' THEN 0 WHEN 'auto_rejected' THEN 1 ELSE 2 END,
           CASE lp.topic_fit WHEN 'none' THEN 0 WHEN 'weak' THEN 1 ELSE 2 END,
           l.track_id ASC, l.sort_order ASC
         LIMIT 200`
      )
      .all(...params);

    res.json({ items: rows });
  });

  router.post('/admin/review/:type/:id', requireRole(db, ['reviewer', 'admin']), (req: AuthedRequest, res) => {
    const { type, id } = req.params;
    const { decision, note } = req.body || {};
    if (!['approve', 'reject', 'request_changes', 'restore_pending'].includes(decision)) {
      errResp(res, 422, 'validation_error', 'Quyết định duyệt không hợp lệ.');
      return;
    }
    if (decision !== 'approve' && (typeof note !== 'string' || !note.trim())) {
      errResp(res, 422, 'validation_error', 'Bắt buộc nhập ghi chú khi từ chối hoặc yêu cầu sửa.');
      return;
    }

    const nowIso = new Date().toISOString();
    if (type === 'lesson_problem') {
      // id format: "<lesson_id>:<problem_id>"
      const [lidStr, pidStr] = id.split(':');
      const lid = Number(lidStr);
      const pid = Number(pidStr);
      const nextStatus =
        decision === 'approve'
          ? 'approved'
          : decision === 'restore_pending'
            ? 'pending'
            : 'rejected';

      const upd = db
        .prepare(
          `UPDATE lesson_problems
           SET review_status = ?, reviewer_note = ?, reviewed_by = ?, reviewed_at = ?
           WHERE lesson_id = ? AND problem_id = ?`
        )
        .run(nextStatus, note?.trim() || null, req.user!.id, nowIso, lid, pid);

      if (upd.changes === 0) {
        errResp(res, 404, 'not_found', 'Không tìm thấy liên kết bài học – bài tập.');
        return;
      }

      db.prepare('INSERT INTO audit_log (actor_id, action, entity, entity_id, diff) VALUES (?, ?, ?, ?, ?)').run(
        req.user!.id,
        `review_${decision}`,
        'lesson_problem',
        id,
        JSON.stringify({ review_status: nextStatus, note: note?.trim() || null })
      );

      res.json({ ok: true, review_status: nextStatus });
      return;
    }

    if (type === 'lesson') {
      const nextStatus = decision === 'approve' ? 'published' : 'draft';
      const upd = db
        .prepare("UPDATE lessons SET status = ?, reviewed_by = ?, reviewed_at = ?, updated_at = datetime('now') WHERE code = ? OR slug = ?")
        .run(nextStatus, req.user!.id, nowIso, id, id);
      if (upd.changes === 0) {
        errResp(res, 404, 'not_found', 'Không tìm thấy bài học.');
        return;
      }
      db.prepare('INSERT INTO audit_log (actor_id, action, entity, entity_id, diff) VALUES (?, ?, ?, ?, ?)').run(
        req.user!.id,
        `review_${decision}`,
        'lesson',
        id,
        JSON.stringify({ status: nextStatus, note: note?.trim() || null })
      );
      res.json({ ok: true, status: nextStatus });
      return;
    }

    if (type === 'problem') {
      const nextStatus = decision === 'approve' ? 'published' : decision === 'reject' ? 'archived' : 'draft';
      const upd = db
        .prepare("UPDATE problems SET status = ?, reviewed_by = ?, reviewed_at = ?, updated_at = datetime('now') WHERE slug = ?")
        .run(nextStatus, req.user!.id, nowIso, id);
      if (upd.changes === 0) {
        errResp(res, 404, 'not_found', 'Không tìm thấy bài tập.');
        return;
      }
      db.prepare('INSERT INTO audit_log (actor_id, action, entity, entity_id, diff) VALUES (?, ?, ?, ?, ?)').run(
        req.user!.id,
        `review_${decision}`,
        'problem',
        id,
        JSON.stringify({ status: nextStatus, note: note?.trim() || null })
      );
      res.json({ ok: true, status: nextStatus });
      return;
    }

    errResp(res, 422, 'validation_error', 'Loại đối tượng duyệt không hợp lệ.');
  });

  router.get('/admin/seed/stats', requireRole(db, ['reviewer', 'admin']), (_req, res) => {
    const rows = db
      .prepare('SELECT * FROM v_lesson_stats ORDER BY track_id ASC, lesson_id ASC')
      .all();
    const runs = db.prepare('SELECT id, git_sha, stats, started_at FROM seed_runs ORDER BY id DESC LIMIT 5').all();
    res.json({
      items: rows,
      meets_5_count: rows.filter((r: any) => Number(r.approved) >= 5).length,
      total_lessons: rows.length,
      recent_runs: runs.map((r: any) => ({ ...r, stats: JSON.parse(r.stats) })),
    });
  });

  router.get('/admin/reports', requireRole(db, ['reviewer', 'admin']), (_req, res) => {
    const rows = db
      .prepare(
        `SELECT r.*, u.handle AS reporter_handle
         FROM reports r LEFT JOIN users u ON u.id = r.user_id
         ORDER BY CASE r.status WHEN 'open' THEN 0 ELSE 1 END, r.id DESC`
      )
      .all();
    res.json({ items: rows });
  });

  router.patch('/admin/reports/:id', requireRole(db, ['reviewer', 'admin']), (req: AuthedRequest, res) => {
    const { status, archive_target } = req.body || {};
    if (!['open', 'resolved', 'dismissed'].includes(status)) {
      errResp(res, 422, 'validation_error', 'Trạng thái báo cáo không hợp lệ.');
      return;
    }
    const rep = db.prepare('SELECT * FROM reports WHERE id = ?').get(Number(req.params.id)) as any;
    if (!rep) {
      errResp(res, 404, 'not_found', 'Không tìm thấy báo cáo.');
      return;
    }
    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, rep.id);
    if (archive_target && (rep.target_type === 'copyright' || rep.target_type === 'problem')) {
      db.prepare("UPDATE problems SET status = 'archived' WHERE slug = ?").run(rep.target_id);
    }
    db.prepare('INSERT INTO audit_log (actor_id, action, entity, entity_id, diff) VALUES (?, ?, ?, ?, ?)').run(
      req.user!.id,
      'update_report',
      'report',
      String(rep.id),
      JSON.stringify({ status, archive_target: Boolean(archive_target) })
    );
    res.json({ ok: true });
  });

  router.put('/admin/lessons/:code', requireRole(db, ['admin']), (req: AuthedRequest, res) => {
    const lesson = db.prepare('SELECT id FROM lessons WHERE code = ?').get(req.params.code) as { id: number } | undefined;
    if (!lesson) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài học.');
      return;
    }
    const { title, complexity, theory_md, common_mistakes_md } = req.body || {};
    db.prepare(
      `UPDATE lessons
       SET title = COALESCE(?, title),
           complexity = COALESCE(?, complexity),
           theory_md = COALESCE(?, theory_md),
           common_mistakes_md = COALESCE(?, common_mistakes_md),
           updated_at = datetime('now')
       WHERE id = ?`
    ).run(title ?? null, complexity ?? null, theory_md ?? null, common_mistakes_md ?? null, lesson.id);

    db.prepare('INSERT INTO audit_log (actor_id, action, entity, entity_id, diff) VALUES (?, ?, ?, ?, ?)').run(
      req.user!.id,
      'edit_lesson',
      'lesson',
      req.params.code,
      JSON.stringify({ title, complexity })
    );
    res.json({ ok: true });
  });

  router.post('/admin/problems/:slug/test-sets', requireRole(db, ['admin']), (req: AuthedRequest, res) => {
    const prob = db.prepare('SELECT id, kind, level FROM problems WHERE slug = ?').get(req.params.slug) as any;
    if (!prob || prob.kind !== 'native') {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài Native.');
      return;
    }

    // §4.2 Rule 7: Cannot change test set during running contest
    const nowIso = new Date().toISOString();
    const runningContest = db
      .prepare(
        `SELECT c.slug FROM contest_problems cp
         JOIN contests c ON c.id = cp.contest_id
         WHERE cp.problem_id = ? AND c.start_at <= ? AND c.end_at >= ?`
      )
      .get(prob.id, nowIso, nowIso) as { slug: string } | undefined;
    if (runningContest) {
      errResp(res, 409, 'conflict', `Không thể đổi bộ test khi bài đang nằm trong contest đang diễn ra (${runningContest.slug}).`);
      return;
    }

    const { tests } = req.body || {};
    if (!Array.isArray(tests) || tests.length === 0 || tests.length > 2000) {
      errResp(res, 422, 'validation_error', 'Danh sách test phải có từ 1 đến 2000 test.');
      return;
    }
    const maxVerRow = db
      .prepare('SELECT COALESCE(MAX(version), 0) AS mv FROM test_sets WHERE problem_id = ?')
      .get(prob.id) as { mv: number };
    const nextVer = Number(maxVerRow.mv) + 1;

    const normalized: TestCaseSpec[] = tests.map((t: any, idx: number) => ({
      name: String(t.name || `${String(idx + 1).padStart(2, '0')}-${t.grp || 'custom'}`),
      grp: String(t.grp || 'custom'),
      ord: idx + 1,
      is_sample: Boolean(t.is_sample),
      input: String(t.input ?? ''),
      expected: String(t.expected ?? ''),
    }));

    const manifest = normalized.map((t) => ({
      name: t.name,
      group: t.grp,
      is_sample: t.is_sample,
      sha256_in: crypto.createHash('sha256').update(t.input).digest('hex'),
      sha256_out: crypto.createHash('sha256').update(t.expected).digest('hex'),
    }));
    const testsJson = JSON.stringify(normalized);
    const sha = crypto.createHash('sha256').update(testsJson).digest('hex');

    const ins = db
      .prepare(
        `INSERT INTO test_sets (problem_id, version, storage_key, sha256, size_bytes, manifest, tests_json, created_by, verified_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        prob.id,
        nextVer,
        `problems/${req.params.slug}/v${nextVer}/tests.json`,
        sha,
        Buffer.byteLength(testsJson, 'utf8'),
        JSON.stringify(manifest),
        testsJson,
        req.user!.id,
        nowIso
      );

    db.prepare('UPDATE native_problems SET active_test_set_id = ? WHERE problem_id = ?').run(
      Number(ins.lastInsertRowid),
      prob.id
    );

    db.prepare('INSERT INTO audit_log (actor_id, action, entity, entity_id, diff) VALUES (?, ?, ?, ?, ?)').run(
      req.user!.id,
      'upload_test_set',
      'problem',
      req.params.slug,
      JSON.stringify({ version: nextVer, count: normalized.length, sha256: sha })
    );

    res.status(201).json({ id: Number(ins.lastInsertRowid), version: nextVer, tests_count: normalized.length, sha256: sha });
  });

  router.post('/admin/submissions/:id/rejudge', requireRole(db, ['admin']), (req: AuthedRequest, res) => {
    const subId = Number(req.params.id);
    const upd = db
      .prepare(
        `UPDATE submissions
         SET status = 'queued', verdict = NULL, score = 0, max_time_ms = NULL, max_memory_kb = NULL,
             tests_passed = NULL, tests_total = NULL, failed_test = NULL, compile_log = NULL, finished_at = NULL
         WHERE id = ?`
      )
      .run(subId);
    if (upd.changes === 0) {
      errResp(res, 404, 'not_found', 'Không tìm thấy bài nộp.');
      return;
    }
    db.prepare('INSERT INTO audit_log (actor_id, action, entity, entity_id, diff) VALUES (?, ?, ?, ?, ?)').run(
      req.user!.id,
      'rejudge',
      'submission',
      String(subId),
      null
    );
    setImmediate(() => void processQueue());
    res.json({ ok: true, id: subId, status: 'queued' });
  });

  router.get('/admin/audit-log', requireRole(db, ['admin', 'reviewer']), (_req, res) => {
    const items = db
      .prepare(
        `SELECT a.*, u.handle AS actor_handle
         FROM audit_log a LEFT JOIN users u ON u.id = a.actor_id
         ORDER BY a.id DESC LIMIT 100`
      )
      .all();
    res.json({ items });
  });

  router.post('/admin/judge/selftest', requireRole(db, ['admin', 'reviewer']), async (_req, res) => {
    const report = await runJudgeSelftest();
    res.json(report);
  });

  return router;
}
