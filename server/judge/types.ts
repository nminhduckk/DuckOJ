export type Verdict = 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'OLE' | 'SE';
export type JudgeLanguage = 'cpp17' | 'python3';
export type CheckerType = 'tokens' | 'lines' | 'float' | 'custom';

export interface RunLimits {
  time_ms: number;
  memory_mb: number;
  output_kb: number;
  language_multiplier?: number;
}

export interface SandboxMeta {
  status: '' | 'OK' | 'TO' | 'SG' | 'RE' | 'XX';
  time: number; // CPU seconds
  timeWall: number; // Wall seconds
  maxRss: number; // KB
  cgMem: number; // KB
  exitcode: number;
  exitsig: number;
  cgOomKilled: boolean;
  killed: boolean;
  message?: string;
}

export interface SandboxRunResult {
  meta: SandboxMeta;
  stdout: string;
  stderr: string;
  stdoutTruncated: boolean;
}

export interface CheckerConfig {
  type: CheckerType;
  params?: {
    eps?: number;
    custom_id?: string;
  };
}

export interface CheckerResult {
  verdict: 'AC' | 'WA' | 'SE';
  message: string;
}

export interface TestCaseSpec {
  name: string;
  grp: string;
  ord: number;
  is_sample: boolean;
  input: string;
  expected: string;
}

export interface TestExecutionResult {
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
