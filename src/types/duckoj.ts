export type Verdict = 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'OLE' | 'SE';
export type UserRole = 'student' | 'reviewer' | 'admin';
export type ProblemStatus = 'not_started' | 'attempted' | 'solved' | 'mastered';
export type LessonStatus = 'not_started' | 'reading' | 'done';

export interface UserProfile {
  public_id: string;
  email: string;
  handle: string;
  name: string;
  role: UserRole;
}

export interface TrackItem {
  id: number;
  name: string;
  description: string;
  estimated_duration: string;
  cf_rating_range: string;
  problem_rating_min: number;
  problem_rating_max: number;
  release_wave: number;
  sort_order: number;
  lessons_count: number;
  problems_count: number;
  native_count: number;
}

export interface TopicItem {
  slug: string;
  name_vi: string;
  cf_tag: string | null;
  is_generic: boolean;
  problem_count?: number;
}

export interface RoadmapNode {
  code: string;
  slug: string;
  track_id: number;
  sort_order: number;
  title: string;
  complexity: string;
  status: string;
  approved_problems: number;
  native_problems: number;
  topics: { slug: string; name_vi: string }[];
  my_status: LessonStatus;
  quiz_best_score: number | null;
}

export interface RoadmapEdge {
  source: string;
  target: string;
}

export interface ProblemSummary {
  slug: string;
  kind: 'native' | 'external';
  title: string;
  source: string;
  source_id: string;
  source_url: string | null;
  level: number;
  difficulty: 'Khởi động' | 'Luyện tập' | 'Thử thách';
  tier?: string;
  cf_rating: number | null;
  editorial_url?: string | null;
  status: string;
  topics: { slug: string; name_vi: string }[];
  lessons?: { code: string; slug: string }[];
  my_status: ProblemStatus;
  review_status?: string;
  topic_fit?: string;
}

export interface ProblemDetail extends ProblemSummary {
  license_note: string;
  lessons: { code: string; slug: string; title: string; tier: string }[];
  native: {
    statement_md: string;
    input_spec_md: string;
    output_spec_md: string;
    notes_md: string;
    samples: { input: string; output: string; explain?: string }[];
    time_limit_ms: number;
    memory_limit_mb: number;
    output_limit_kb: number;
    checker: string;
    scoring: string;
    allowed_languages: ('cpp17' | 'python3')[];
    test_version: number | null;
    tests_count: number;
  } | null;
  unlocked_hints: { level: number; type: string; text_md: string }[];
  total_hints: number;
  my_progress: {
    status: ProblemStatus;
    attempts: number;
    solved_via: 'judge' | 'self_report' | null;
    first_solved_at: string | null;
    last_attempt_at: string | null;
    hint_level: number;
    hint_unlocked_at: string | null;
    notes: string;
  };
}

export interface LessonDetail {
  code: string;
  slug: string;
  track_id: number;
  track_name: string;
  cf_rating_range: string;
  title: string;
  objectives_md: string;
  theory_md: string;
  code_sample: string;
  code_sample_ok: boolean;
  complexity: string;
  common_mistakes_md: string;
  sources: { kind: string; title: string; url: string }[];
  hints: { level: number; type: string; text_md: string }[];
  quiz: { index: number; q: string; options: string[] }[];
  prereqs: { code: string; slug: string; title: string }[];
  topics: { slug: string; name_vi: string; is_generic: number }[];
  problems: ProblemSummary[];
  my_progress: {
    status: LessonStatus;
    quiz_best_score: number | null;
  };
}

export interface SubmissionTestRow {
  test_name: string;
  grp: string;
  ord: number;
  verdict: Verdict;
  time_ms: number;
  memory_kb: number;
  is_sample: boolean;
  checker_msg: string;
  stdin_preview: string | null;
  stdout_preview: string | null;
  expected_preview: string | null;
}

export interface SubmissionDetail {
  id: number;
  problem_slug: string;
  problem_title: string;
  user_handle: string;
  language: 'cpp17' | 'python3';
  source_code: string;
  status: 'queued' | 'judging' | 'done' | 'system_error';
  verdict: Verdict | null;
  score: number;
  max_time_ms: number | null;
  max_memory_kb: number | null;
  tests_passed: number | null;
  tests_total: number | null;
  failed_test: string | null;
  compile_log: string | null;
  submitted_at: string;
  finished_at: string | null;
  tests: SubmissionTestRow[];
}

export interface ContestItem {
  id: number;
  slug: string;
  title: string;
  description_md: string;
  start_at: string;
  end_at: string;
  scoring: 'icpc' | 'oi';
  penalty_minutes: number;
  phase: 'upcoming' | 'running' | 'ended';
  joined: boolean;
  problem_count?: number;
  participant_count: number;
  problems?: {
    label: string;
    points: number;
    slug: string;
    title: string;
    level: number;
    difficulty: string;
    time_limit_ms: number;
    memory_limit_mb: number;
  }[];
}
