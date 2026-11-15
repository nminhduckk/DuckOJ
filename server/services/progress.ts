import type { Verdict } from '../judge/types';

export type ProgressStatus = 'not_started' | 'attempted' | 'solved' | 'mastered';

export interface ProgressRow {
  status: ProgressStatus;
  attempts: number;
  solved_via: 'judge' | 'self_report' | null;
  first_solved_at: string | null;
  last_attempt_at: string | null;
  hint_level: number;
  hint_unlocked_at: string | null;
  notes: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const THREE_MINUTES_MS = 3 * 60 * 1000;
const FIVE_MINUTES_MS = 5 * 60 * 1000;

/**
 * §4.2 Rule 5: Pure progress transition after a judge verdict finishes.
 * - CE does not count as an attempt and does not mutate status.
 * - Non-AC increments attempts and transitions not_started -> attempted.
 * - AC sets solved (solved_via = judge, first_solved_at if empty);
 *   if already solved and >= 7 days since first_solved_at, promotes to mastered.
 * - Never downgrades solved/mastered.
 */
export function applyJudgeOutcomeToProgress(
  current: ProgressRow | null,
  verdict: Verdict,
  nowIso = new Date().toISOString()
): ProgressRow {
  const base: ProgressRow = current
    ? { ...current }
    : {
        status: 'not_started',
        attempts: 0,
        solved_via: null,
        first_solved_at: null,
        last_attempt_at: null,
        hint_level: 0,
        hint_unlocked_at: null,
        notes: '',
      };

  if (verdict === 'CE') {
    return base;
  }

  base.attempts += 1;
  base.last_attempt_at = nowIso;

  if (verdict === 'AC') {
    if (base.status === 'solved' || base.status === 'mastered') {
      base.solved_via = 'judge';
      if (!base.first_solved_at) base.first_solved_at = nowIso;
      const firstMs = Date.parse(base.first_solved_at);
      const nowMs = Date.parse(nowIso);
      if (!Number.isNaN(firstMs) && nowMs - firstMs >= SEVEN_DAYS_MS) {
        base.status = 'mastered';
      } else if (base.status !== 'mastered') {
        base.status = 'solved';
      }
    } else {
      base.status = 'solved';
      base.solved_via = 'judge';
      if (!base.first_solved_at) base.first_solved_at = nowIso;
    }
  } else {
    if (base.status === 'not_started') {
      base.status = 'attempted';
    }
  }

  return base;
}

/**
 * §4.2 Rule 5: External problem manual marking.
 * Never downgrades a problem whose solved_via === 'judge'.
 */
export function applyExternalMarkToProgress(
  current: ProgressRow | null,
  targetStatus: 'not_started' | 'attempted' | 'solved' | 'mastered',
  notes?: string,
  nowIso = new Date().toISOString()
): ProgressRow {
  const base: ProgressRow = current
    ? { ...current }
    : {
        status: 'not_started',
        attempts: 0,
        solved_via: null,
        first_solved_at: null,
        last_attempt_at: null,
        hint_level: 0,
        hint_unlocked_at: null,
        notes: '',
      };

  if (typeof notes === 'string') {
    base.notes = notes;
  }

  // Never downgrade judge-solved problems
  if (base.solved_via === 'judge' && (targetStatus === 'not_started' || targetStatus === 'attempted')) {
    return base;
  }

  if (targetStatus === 'mastered') {
    if (base.status === 'solved' && base.first_solved_at) {
      const diff = Date.parse(nowIso) - Date.parse(base.first_solved_at);
      if (diff >= SEVEN_DAYS_MS) {
        base.status = 'mastered';
      }
    }
    return base;
  }

  base.status = targetStatus;
  if (targetStatus === 'solved') {
    base.solved_via = 'self_report';
    if (!base.first_solved_at) base.first_solved_at = nowIso;
    if (!base.last_attempt_at) base.last_attempt_at = nowIso;
    if (base.attempts === 0) base.attempts = 1;
  } else if (targetStatus === 'attempted') {
    if (base.attempts === 0) base.attempts = 1;
    base.last_attempt_at = nowIso;
  }

  return base;
}

export interface HintUnlockDecision {
  allowed: boolean;
  nextLevel: number;
  reason?: string;
  needsAttempts?: number;
  unlockAt?: string;
}

/**
 * §4.2 Rule 6: Progressive 4-level hint unlock.
 * - Must wait >= 3 minutes between two consecutive unlocks.
 * - Level 1: >= 1 submission attempt OR >= 5 minutes since first_opened_at.
 * - Level 2: >= 2 attempts.
 * - Level 3: >= 3 attempts.
 * - Level 4: >= 5 attempts OR status in ('solved', 'mastered').
 */
export function evaluateHintUnlock(
  progress: Pick<ProgressRow, 'status' | 'attempts' | 'hint_level' | 'hint_unlocked_at'>,
  firstOpenedIso?: string | null,
  nowMs = Date.now()
): HintUnlockDecision {
  const nextLevel = progress.hint_level + 1;
  if (nextLevel > 4) {
    return { allowed: false, nextLevel: 4, reason: 'Bạn đã mở hết 4 gợi ý.' };
  }

  if (progress.hint_unlocked_at) {
    const lastUnlockMs = Date.parse(progress.hint_unlocked_at);
    if (!Number.isNaN(lastUnlockMs) && nowMs - lastUnlockMs < THREE_MINUTES_MS) {
      const unlockAt = new Date(lastUnlockMs + THREE_MINUTES_MS).toISOString();
      return {
        allowed: false,
        nextLevel,
        reason: 'Hãy đợi ít nhất 3 phút rồi mở gợi ý tiếp theo.',
        unlockAt,
      };
    }
  }

  if (nextLevel === 1) {
    const openedMs = firstOpenedIso ? Date.parse(firstOpenedIso) : NaN;
    const waitedEnough = !Number.isNaN(openedMs) && nowMs - openedMs >= FIVE_MINUTES_MS;
    if (progress.attempts >= 1 || waitedEnough || progress.status === 'solved' || progress.status === 'mastered') {
      return { allowed: true, nextLevel: 1 };
    }
    const unlockAt = !Number.isNaN(openedMs) ? new Date(openedMs + FIVE_MINUTES_MS).toISOString() : undefined;
    return {
      allowed: false,
      nextLevel: 1,
      needsAttempts: 1,
      unlockAt,
      reason: 'Hãy nộp thử ít nhất 1 lần hoặc đọc đề đủ 5 phút để mở Gợi ý 1.',
    };
  }

  if (nextLevel === 2) {
    if (progress.attempts >= 2 || progress.status === 'solved' || progress.status === 'mastered') {
      return { allowed: true, nextLevel: 2 };
    }
    return {
      allowed: false,
      nextLevel: 2,
      needsAttempts: 2 - progress.attempts,
      reason: `Nộp thêm ${2 - progress.attempts} lần để mở Gợi ý 2.`,
    };
  }

  if (nextLevel === 3) {
    if (progress.attempts >= 3 || progress.status === 'solved' || progress.status === 'mastered') {
      return { allowed: true, nextLevel: 3 };
    }
    return {
      allowed: false,
      nextLevel: 3,
      needsAttempts: 3 - progress.attempts,
      reason: `Nộp thêm ${3 - progress.attempts} lần để mở Gợi ý 3.`,
    };
  }

  // Level 4
  if (progress.attempts >= 5 || progress.status === 'solved' || progress.status === 'mastered') {
    return { allowed: true, nextLevel: 4 };
  }
  return {
    allowed: false,
    nextLevel: 4,
    needsAttempts: 5 - progress.attempts,
    reason: `Nộp thêm ${5 - progress.attempts} lần (hoặc làm đúng bài) để mở Code mẫu.`,
  };
}
