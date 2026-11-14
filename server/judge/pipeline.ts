import { EventEmitter } from 'node:events';
import { prepareProgram, runInSandbox } from './sandbox';
import { classifyVerdict } from './verdict';
import { runChecker } from './checker';
import type {
  CheckerConfig,
  JudgeLanguage,
  RunLimits,
  TestCaseSpec,
  TestExecutionResult,
  Verdict,
} from './types';

export interface SubmissionJobInput {
  submissionId: number;
  language: JudgeLanguage;
  sourceCode: string;
  limits: RunLimits;
  checker: CheckerConfig;
  scoring: 'all_or_nothing' | 'per_test' | 'subtasks';
  tests: TestCaseSpec[];
}

export interface SubmissionFinalOutcome {
  verdict: Verdict;
  score: number;
  max_time_ms: number;
  max_memory_kb: number;
  tests_passed: number;
  tests_total: number;
  failed_test: string | null;
  compile_log: string | null;
  tests: TestExecutionResult[];
}

export const judgeEventBus = new EventEmitter();
judgeEventBus.setMaxListeners(200);

export function emitSubmissionEvent(submissionId: number, event: string, payload: unknown) {
  judgeEventBus.emit(`sub:${submissionId}`, { event, payload });
}

export async function executeJudgeJob(job: SubmissionJobInput): Promise<SubmissionFinalOutcome> {
  emitSubmissionEvent(job.submissionId, 'status', { status: 'judging', stage: 'compiling' });

  const prepared = prepareProgram(job.language, job.sourceCode);
  if (!prepared.ok) {
    const out: SubmissionFinalOutcome = {
      verdict: 'CE',
      score: 0,
      max_time_ms: 0,
      max_memory_kb: 0,
      tests_passed: 0,
      tests_total: job.tests.length,
      failed_test: null,
      compile_log: prepared.compileLog,
      tests: [],
    };
    emitSubmissionEvent(job.submissionId, 'done', out);
    return out;
  }

  emitSubmissionEvent(job.submissionId, 'status', {
    status: 'judging',
    stage: 'running',
    tests_total: job.tests.length,
  });

  const orderedTests = [...job.tests].sort((a, b) => a.ord - b.ord);
  const multiplier = job.language === 'python3' ? 3 : 1;
  const effectiveTlMs = Math.min(10000, job.limits.time_ms * multiplier);

  const testResults: TestExecutionResult[] = [];
  let finalVerdict: Verdict = 'AC';
  let maxTimeMs = 0;
  let maxMemoryKb = 0;
  let passedCount = 0;
  let failedTest: string | null = null;

  for (const t of orderedTests) {
    let runRes = await runInSandbox(prepared, t.input, {
      ...job.limits,
      language_multiplier: multiplier,
    });
    let cls = classifyVerdict(runRes.meta, effectiveTlMs, job.limits.memory_mb, runRes.stdoutTruncated);

    // §7.4 stability re-run: if time falls in [0.9 * TL, 1.15 * TL], rerun up to 2 times and take min time
    if (cls.time_ms >= 0.9 * effectiveTlMs && cls.time_ms <= 1.15 * effectiveTlMs) {
      for (let retry = 0; retry < 2; retry++) {
        const retryRun = await runInSandbox(prepared, t.input, {
          ...job.limits,
          language_multiplier: multiplier,
        });
        const retryCls = classifyVerdict(retryRun.meta, effectiveTlMs, job.limits.memory_mb, retryRun.stdoutTruncated);
        if (retryCls.time_ms < cls.time_ms) {
          runRes = retryRun;
          cls = retryCls;
        }
      }
    }

    let testVerdict: Verdict = cls.verdict === 'OK' ? 'AC' : cls.verdict;
    let checkerMsg = cls.reason;

    if (cls.verdict === 'OK') {
      const chk = runChecker(job.checker, t.input, runRes.stdout, t.expected);
      testVerdict = chk.verdict;
      checkerMsg = chk.message;
    }

    if (cls.time_ms > maxTimeMs) maxTimeMs = cls.time_ms;
    if (cls.memory_kb > maxMemoryKb) maxMemoryKb = cls.memory_kb;

    if (testVerdict === 'AC') {
      passedCount++;
    } else if (finalVerdict === 'AC') {
      finalVerdict = testVerdict;
      failedTest = t.name;
    }

    const row: TestExecutionResult = {
      test_name: t.name,
      grp: t.grp,
      ord: t.ord,
      verdict: testVerdict,
      time_ms: cls.time_ms,
      memory_kb: cls.memory_kb,
      is_sample: t.is_sample,
      checker_msg: checkerMsg.slice(0, 500),
      stdin_preview: t.is_sample ? t.input.slice(0, 1000) : null,
      stdout_preview: t.is_sample ? runRes.stdout.slice(0, 1000) : null,
      expected_preview: t.is_sample ? t.expected.slice(0, 1000) : null,
    };

    testResults.push(row);
    emitSubmissionEvent(job.submissionId, 'test', row);

    if (testVerdict !== 'AC' && job.scoring === 'all_or_nothing') {
      break;
    }
  }

  const score =
    finalVerdict === 'AC'
      ? 100
      : job.scoring === 'per_test' && orderedTests.length > 0
        ? Math.round((passedCount / orderedTests.length) * 100)
        : 0;

  const outcome: SubmissionFinalOutcome = {
    verdict: finalVerdict,
    score,
    max_time_ms: maxTimeMs,
    max_memory_kb: maxMemoryKb,
    tests_passed: passedCount,
    tests_total: orderedTests.length,
    failed_test: failedTest,
    compile_log: null,
    tests: testResults,
  };

  emitSubmissionEvent(job.submissionId, 'done', outcome);
  return outcome;
}
