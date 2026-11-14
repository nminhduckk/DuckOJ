import type { Verdict } from '../judge/types';

export interface ContestProblemMeta {
  problem_id: number;
  label: string;
}

export interface ContestSubmissionInput {
  user_id: number;
  handle: string;
  name: string;
  problem_id: number;
  verdict: Verdict | null;
  submitted_at: string;
}

export interface StandingProblemCell {
  label: string;
  solved: boolean;
  wrong_attempts: number;
  ac_minutes: number | null;
}

export interface StandingRow {
  rank: number;
  user_id: number;
  handle: string;
  name: string;
  solved_count: number;
  penalty: number;
  problems: Record<string, StandingProblemCell>;
}

/**
 * §4.2 Rule 7: Pure ICPC standings calculation.
 * - More AC problems ranks higher.
 * - Tie-breaker: smaller penalty = sum(minutes from start to first AC + penalty_minutes * prior wrong attempts).
 * - CE submissions are NOT penalized.
 * - Submissions after AC on the same problem are ignored.
 */
export function computeIcpcStandings(
  startAtIso: string,
  penaltyMinutes: number,
  problems: ContestProblemMeta[],
  participants: { user_id: number; handle: string; name: string }[],
  submissions: ContestSubmissionInput[]
): StandingRow[] {
  const startMs = Date.parse(startAtIso);
  const labelByProblem = new Map(problems.map((p) => [p.problem_id, p.label]));

  const userRows = new Map<
    number,
    {
      user_id: number;
      handle: string;
      name: string;
      cells: Record<string, StandingProblemCell>;
    }
  >();

  const ensureUser = (u: { user_id: number; handle: string; name: string }) => {
    let entry = userRows.get(u.user_id);
    if (!entry) {
      const cells: Record<string, StandingProblemCell> = {};
      for (const p of problems) {
        cells[p.label] = { label: p.label, solved: false, wrong_attempts: 0, ac_minutes: null };
      }
      entry = { user_id: u.user_id, handle: u.handle, name: u.name, cells };
      userRows.set(u.user_id, entry);
    }
    return entry;
  };

  for (const p of participants) ensureUser(p);

  const orderedSubs = [...submissions].sort(
    (a, b) => Date.parse(a.submitted_at) - Date.parse(b.submitted_at)
  );

  for (const sub of orderedSubs) {
    if (!sub.verdict || sub.verdict === 'CE' || sub.verdict === 'SE') continue;
    const label = labelByProblem.get(sub.problem_id);
    if (!label) continue;

    const uRow = ensureUser({ user_id: sub.user_id, handle: sub.handle, name: sub.name });
    const cell = uRow.cells[label];
    if (cell.solved) continue;

    if (sub.verdict === 'AC') {
      const subMs = Date.parse(sub.submitted_at);
      const mins = Math.max(0, Math.floor((subMs - startMs) / 60000));
      cell.solved = true;
      cell.ac_minutes = mins;
    } else {
      cell.wrong_attempts += 1;
    }
  }

  const rows: StandingRow[] = Array.from(userRows.values()).map((u) => {
    let solved_count = 0;
    let penalty = 0;
    for (const cell of Object.values(u.cells)) {
      if (cell.solved && cell.ac_minutes !== null) {
        solved_count += 1;
        penalty += cell.ac_minutes + cell.wrong_attempts * penaltyMinutes;
      }
    }
    return {
      rank: 0,
      user_id: u.user_id,
      handle: u.handle,
      name: u.name,
      solved_count,
      penalty,
      problems: u.cells,
    };
  });

  rows.sort((a, b) => {
    if (b.solved_count !== a.solved_count) return b.solved_count - a.solved_count;
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return a.handle.localeCompare(b.handle);
  });

  for (let i = 0; i < rows.length; i++) {
    if (
      i > 0 &&
      rows[i].solved_count === rows[i - 1].solved_count &&
      rows[i].penalty === rows[i - 1].penalty
    ) {
      rows[i].rank = rows[i - 1].rank;
    } else {
      rows[i].rank = i + 1;
    }
  }

  return rows;
}
