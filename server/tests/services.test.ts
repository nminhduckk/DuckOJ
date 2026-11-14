import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyExternalMarkToProgress,
  applyJudgeOutcomeToProgress,
  evaluateHintUnlock,
} from '../services/progress';
import { computeIcpcStandings } from '../services/scoreboard';

describe('Progress Rules, Progressive Hints, and ICPC Standings (§4.2)', () => {
  it('enforces §4.2 Rule 5 progress state machine', () => {
    // CE does not increment attempts or mutate status
    const afterCe = applyJudgeOutcomeToProgress(null, 'CE', '2026-11-14T10:00:00Z');
    assert.equal(afterCe.status, 'not_started');
    assert.equal(afterCe.attempts, 0);

    // WA transitions not_started -> attempted
    const afterWa = applyJudgeOutcomeToProgress(afterCe, 'WA', '2026-11-14T10:01:00Z');
    assert.equal(afterWa.status, 'attempted');
    assert.equal(afterWa.attempts, 1);

    // AC transitions attempted -> solved with solved_via = judge
    const afterAc = applyJudgeOutcomeToProgress(afterWa, 'AC', '2026-11-14T10:05:00Z');
    assert.equal(afterAc.status, 'solved');
    assert.equal(afterAc.solved_via, 'judge');
    assert.equal(afterAc.first_solved_at, '2026-11-14T10:05:00Z');
    assert.equal(afterAc.attempts, 2);

    // Re-AC within 7 days stays solved
    const reAcSameWeek = applyJudgeOutcomeToProgress(afterAc, 'AC', '2026-11-17T10:05:00Z');
    assert.equal(reAcSameWeek.status, 'solved');

    // Re-AC >= 7 days promotes to mastered
    const reAcLater = applyJudgeOutcomeToProgress(reAcSameWeek, 'AC', '2026-11-22T10:05:00Z');
    assert.equal(reAcLater.status, 'mastered');

    // External mark cannot downgrade judge-solved problems
    const attemptedDowngrade = applyExternalMarkToProgress(afterAc, 'attempted', 'note');
    assert.equal(attemptedDowngrade.status, 'solved');
    assert.equal(attemptedDowngrade.notes, 'note');
  });

  it('enforces §4.2 Rule 6 progressive hint unlock cooldown and attempt thresholds', () => {
    const t0 = Date.parse('2026-11-14T10:00:00Z');

    // Locked at 0 attempts and < 5 mins
    const d0 = evaluateHintUnlock(
      { status: 'not_started', attempts: 0, hint_level: 0, hint_unlocked_at: null },
      '2026-11-14T09:58:00Z',
      t0
    );
    assert.equal(d0.allowed, false);

    // Unlocked level 1 after >= 5 minutes
    const d1Time = evaluateHintUnlock(
      { status: 'not_started', attempts: 0, hint_level: 0, hint_unlocked_at: null },
      '2026-11-14T09:54:00Z',
      t0
    );
    assert.equal(d1Time.allowed, true);
    assert.equal(d1Time.nextLevel, 1);

    // Level 2 blocked during 3-minute cooldown even with 2 attempts
    const d2Cooldown = evaluateHintUnlock(
      {
        status: 'attempted',
        attempts: 2,
        hint_level: 1,
        hint_unlocked_at: '2026-11-14T09:59:00Z',
      },
      null,
      t0
    );
    assert.equal(d2Cooldown.allowed, false);
    assert.ok(d2Cooldown.unlockAt);

    // Level 2 allowed after 3 mins and >= 2 attempts
    const d2Ok = evaluateHintUnlock(
      {
        status: 'attempted',
        attempts: 2,
        hint_level: 1,
        hint_unlocked_at: '2026-11-14T09:56:00Z',
      },
      null,
      t0
    );
    assert.equal(d2Ok.allowed, true);
    assert.equal(d2Ok.nextLevel, 2);

    // Level 4 allowed immediately after cooldown when solved
    const d4Solved = evaluateHintUnlock(
      {
        status: 'solved',
        attempts: 1,
        hint_level: 3,
        hint_unlocked_at: '2026-11-14T09:56:00Z',
      },
      null,
      t0
    );
    assert.equal(d4Solved.allowed, true);
    assert.equal(d4Solved.nextLevel, 4);
  });

  it('computes ICPC standings excluding CE penalty and ignoring post-AC submissions', () => {
    const start = '2026-11-14T08:00:00Z';
    const problems = [
      { problem_id: 1, label: 'A' },
      { problem_id: 2, label: 'B' },
    ];
    const participants = [
      { user_id: 10, handle: 'alice', name: 'Alice' },
      { user_id: 11, handle: 'bob', name: 'Bob' },
    ];
    const subs = [
      // Alice: CE on A (no penalty), WA on A (+20), AC on A at +15m => 35
      { user_id: 10, handle: 'alice', name: 'Alice', problem_id: 1, verdict: 'CE' as const, submitted_at: '2026-11-14T08:05:00Z' },
      { user_id: 10, handle: 'alice', name: 'Alice', problem_id: 1, verdict: 'WA' as const, submitted_at: '2026-11-14T08:10:00Z' },
      { user_id: 10, handle: 'alice', name: 'Alice', problem_id: 1, verdict: 'AC' as const, submitted_at: '2026-11-14T08:15:00Z' },
      // Post-AC WA should be ignored
      { user_id: 10, handle: 'alice', name: 'Alice', problem_id: 1, verdict: 'WA' as const, submitted_at: '2026-11-14T08:20:00Z' },
      // Bob: AC on A at +25m => 25 (beats Alice on tie-break!)
      { user_id: 11, handle: 'bob', name: 'Bob', problem_id: 1, verdict: 'AC' as const, submitted_at: '2026-11-14T08:25:00Z' },
    ];

    const standings = computeIcpcStandings(start, 20, problems, participants, subs);
    assert.equal(standings[0].handle, 'bob');
    assert.equal(standings[0].solved_count, 1);
    assert.equal(standings[0].penalty, 25);

    assert.equal(standings[1].handle, 'alice');
    assert.equal(standings[1].solved_count, 1);
    assert.equal(standings[1].penalty, 35);
  });
});
