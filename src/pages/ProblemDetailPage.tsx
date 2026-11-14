import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  HelpCircle,
  Lock,
  Play,
  Trophy,
  Unlock,
} from 'lucide-react';
import { apiFetch, ApiError, getAccessToken } from '../lib/api';
import { formatVnDateTime } from '../lib/i18n';
import { useApp } from '../context/AppContext';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { CodeEditor, DEFAULT_TEMPLATES } from '../components/CodeEditor';
import { ProblemStatusLabel, VerdictBadge } from '../components/VerdictBadge';
import { ReportModal } from '../components/ReportModal';
import type { ProblemDetail, ProblemStatus, SubmissionDetail, SubmissionTestRow, Verdict } from '../types/duckoj';

interface LiveJudgeState {
  submissionId: number;
  status: string;
  verdict: Verdict | null;
  score: number;
  max_time_ms: number | null;
  max_memory_kb: number | null;
  tests_passed: number;
  tests_total: number;
  failed_test: string | null;
  compile_log: string | null;
  tests: SubmissionTestRow[];
}

export function ProblemDetailPage({ slug }: { slug: string }) {
  const { user, locale, t, search, navigate } = useApp();
  const contestSlug = useMemo(() => new URLSearchParams(search).get('contest') || '', [search]);

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [leftTab, setLeftTab] = useState<'statement' | 'submissions' | 'hints'>('statement');
  const [language, setLanguage] = useState<'cpp17' | 'python3'>('cpp17');
  const [code, setCode] = useState<string>(DEFAULT_TEMPLATES.cpp17);

  const [mySubs, setMySubs] = useState<SubmissionDetail[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [liveJudge, setLiveJudge] = useState<LiveJudgeState | null>(null);

  const [hintErr, setHintErr] = useState<string | null>(null);
  const [unlockingHint, setUnlockingHint] = useState(false);

  const [extStatus, setExtStatus] = useState<ProblemStatus>('not_started');
  const [extNotes, setExtNotes] = useState('');
  const [savingExt, setSavingExt] = useState(false);
  const [extMsg, setExtMsg] = useState<string | null>(null);

  const [copiedSampleIdx, setCopiedSampleIdx] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const abortSseRef = useRef<AbortController | null>(null);

  const loadProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await apiFetch<ProblemDetail>(`/problems/${encodeURIComponent(slug)}`);
      setProblem(p);
      setExtStatus(p.my_progress.status);
      setExtNotes(p.my_progress.notes || '');
      if (user && p.kind === 'native') {
        apiFetch<{ items: SubmissionDetail[] }>(`/me/submissions?problem=${encodeURIComponent(slug)}&page_size=20`)
          .then((r) => setMySubs(r.items))
          .catch(() => {});
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải bài tập.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLiveJudge(null);
    setSubmitErr(null);
    setHintErr(null);
    setExtMsg(null);
    void loadProblem();
    return () => {
      abortSseRef.current?.abort();
    };
  }, [slug, user?.public_id]);

  // Restore draft from localStorage on slug or language change
  useEffect(() => {
    const key = `duckoj_draft:${slug}:${language}`;
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    setCode(saved !== null ? saved : DEFAULT_TEMPLATES[language]);
  }, [slug, language]);

  const handleCodeChange = (next: string) => {
    setCode(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`duckoj_draft:${slug}:${language}`, next);
    }
  };

  const streamSubmissionEvents = async (subId: number) => {
    abortSseRef.current?.abort();
    const ctrl = new AbortController();
    abortSseRef.current = ctrl;

    const token = getAccessToken();
    try {
      const res = await fetch(`/api/v1/submissions/${subId}/events`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error('SSE unavailable');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = 'message';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const rawLine of lines) {
          const line = rawLine.trimEnd();
          if (!line) {
            currentEvent = 'message';
            continue;
          }
          if (line.startsWith(':')) continue;
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const payload = JSON.parse(line.slice(5).trim());
            if (currentEvent === 'status') {
              setLiveJudge((prev) =>
                prev
                  ? { ...prev, status: payload.status || 'judging', tests_total: payload.tests_total ?? prev.tests_total }
                  : prev
              );
            } else if (currentEvent === 'compile') {
              setLiveJudge((prev) =>
                prev
                  ? {
                      ...prev,
                      status: payload.ok ? 'judging' : 'done',
                      verdict: payload.ok ? prev.verdict : 'CE',
                      compile_log: payload.log || null,
                    }
                  : prev
              );
            } else if (currentEvent === 'test') {
              setLiveJudge((prev) => {
                if (!prev) return prev;
                const nextTests = [...prev.tests.filter((x) => x.test_name !== payload.test_name), payload].sort(
                  (a, b) => a.ord - b.ord
                );
                return {
                  ...prev,
                  tests: nextTests,
                  tests_passed: nextTests.filter((x) => x.verdict === 'AC').length,
                };
              });
            } else if (currentEvent === 'done') {
              const detail = await apiFetch<SubmissionDetail>(`/submissions/${subId}`);
              setLiveJudge({
                submissionId: detail.id,
                status: detail.status,
                verdict: detail.verdict,
                score: detail.score,
                max_time_ms: detail.max_time_ms,
                max_memory_kb: detail.max_memory_kb,
                tests_passed: detail.tests_passed ?? 0,
                tests_total: detail.tests_total ?? 0,
                failed_test: detail.failed_test,
                compile_log: detail.compile_log,
                tests: detail.tests || [],
              });
              setSubmitting(false);
              // Refresh problem status and submission history
              const [pUpd, subsUpd] = await Promise.all([
                apiFetch<ProblemDetail>(`/problems/${encodeURIComponent(slug)}`),
                apiFetch<{ items: SubmissionDetail[] }>(`/me/submissions?problem=${encodeURIComponent(slug)}&page_size=20`),
              ]);
              setProblem(pUpd);
              setMySubs(subsUpd.items);
              return;
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      // Fallback polling if SSE closes early
      for (let i = 0; i < 25; i++) {
        await new Promise((r) => setTimeout(r, 400));
        try {
          const detail = await apiFetch<SubmissionDetail>(`/submissions/${subId}`);
          if (detail.status === 'done' || detail.status === 'system_error') {
            setLiveJudge({
              submissionId: detail.id,
              status: detail.status,
              verdict: detail.verdict,
              score: detail.score,
              max_time_ms: detail.max_time_ms,
              max_memory_kb: detail.max_memory_kb,
              tests_passed: detail.tests_passed ?? 0,
              tests_total: detail.tests_total ?? 0,
              failed_test: detail.failed_test,
              compile_log: detail.compile_log,
              tests: detail.tests || [],
            });
            setSubmitting(false);
            void loadProblem();
            return;
          }
        } catch {
          break;
        }
      }
      setSubmitting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!problem) return;
    setSubmitErr(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ id: number; status: string }>(`/problems/${problem.slug}/submissions`, {
        method: 'POST',
        body: JSON.stringify({
          language,
          source_code: code,
          contest_slug: contestSlug || undefined,
        }),
      });
      setLiveJudge({
        submissionId: res.id,
        status: res.status,
        verdict: null,
        score: 0,
        max_time_ms: null,
        max_memory_kb: null,
        tests_passed: 0,
        tests_total: problem.native?.tests_count || 0,
        failed_test: null,
        compile_log: null,
        tests: [],
      });
      void streamSubmissionEvents(res.id);
    } catch (err) {
      setSubmitErr(err instanceof ApiError ? err.message : 'Không thể nộp bài.');
      setSubmitting(false);
    }
  };

  const handleUnlockHint = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!problem) return;
    setHintErr(null);
    setUnlockingHint(true);
    try {
      const res = await apiFetch<{ hint_level: number; hint: { level: number; type: string; text_md: string } }>(
        `/problems/${problem.slug}/hints/unlock`,
        { method: 'POST' }
      );
      setProblem({
        ...problem,
        unlocked_hints: [...problem.unlocked_hints.filter((h) => h.level !== res.hint.level), res.hint].sort(
          (a, b) => a.level - b.level
        ),
        my_progress: { ...problem.my_progress, hint_level: res.hint_level },
      });
    } catch (err) {
      setHintErr(err instanceof ApiError ? err.message : 'Chưa thể mở gợi ý lúc này.');
    } finally {
      setUnlockingHint(false);
    }
  };

  const handleSaveExternalMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!problem) return;
    setSavingExt(true);
    setExtMsg(null);
    try {
      const res = await apiFetch<{ progress: ProblemDetail['my_progress'] }>(`/problems/${problem.slug}/mark`, {
        method: 'PUT',
        body: JSON.stringify({ status: extStatus, notes: extNotes }),
      });
      setProblem({ ...problem, my_progress: res.progress });
      setExtMsg(locale === 'vi' ? 'Đã lưu trạng thái và ghi chú.' : 'Progress and notes saved.');
    } catch (err) {
      setExtMsg(err instanceof ApiError ? err.message : 'Không thể lưu.');
    } finally {
      setSavingExt(false);
    }
  };

  const handleExternalTried = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!problem) return;
    try {
      const res = await apiFetch<{ status: ProblemStatus; attempts: number }>(`/problems/${problem.slug}/tried`, {
        method: 'POST',
      });
      setExtStatus(res.status);
      setProblem({
        ...problem,
        my_progress: { ...problem.my_progress, status: res.status, attempts: res.attempts },
      });
      setExtMsg(
        locale === 'vi'
          ? `Đã ghi nhận lần thử thứ ${res.attempts}.`
          : `Recorded attempt #${res.attempts}.`
      );
    } catch (err) {
      setExtMsg(err instanceof ApiError ? err.message : 'Không thể ghi nhận.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <div className="h-10 w-64 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-[520px] rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <p className="text-rose-600 dark:text-rose-400">{error || 'Không tìm thấy bài tập.'}</p>
        <button
          type="button"
          onClick={() => navigate('/problems')}
          className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium"
        >
          {locale === 'vi' ? 'Quay lại kho bài tập' : 'Back to problems'}
        </button>
      </div>
    );
  }

  const renderHintsPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
          {locale === 'vi'
            ? `Đã mở ${problem.unlocked_hints.length} / ${problem.total_hints} tầng gợi ý`
            : `Unlocked ${problem.unlocked_hints.length} / ${problem.total_hints} hint tiers`}
        </p>
        {problem.unlocked_hints.length < problem.total_hints && (
          <button
            type="button"
            disabled={unlockingHint}
            onClick={handleUnlockHint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>
              {unlockingHint
                ? locale === 'vi'
                  ? 'Đang mở...'
                  : 'Unlocking...'
                : locale === 'vi'
                  ? `Mở gợi ý cấp ${problem.unlocked_hints.length + 1}`
                  : `Unlock Hint ${problem.unlocked_hints.length + 1}`}
            </span>
          </button>
        )}
      </div>

      {hintErr && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{hintErr}</span>
        </div>
      )}

      {problem.unlocked_hints.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
          <p className="font-medium text-slate-800 dark:text-slate-200">
            {locale === 'vi' ? 'Gợi ý mở theo tiến độ thử sức' : 'Progressive Anti-Spoil Hints'}
          </p>
          <p>
            {locale === 'vi'
              ? 'Tầng 1 mở sau 1 lần nộp/thử hoặc sau 5 phút đọc đề. Các tầng cao hơn mở sau 2/3/5 lần thử và thời gian chờ 10 phút giữa mỗi tầng.'
              : 'Tier 1 unlocks after 1 attempt or 5 minutes. Higher tiers require 2/3/5 attempts and a 10-minute cooldown.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {problem.unlocked_hints.map((h) => (
            <div
              key={h.level}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-2"
            >
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>
                  {locale === 'vi' ? `Gợi ý tầng ${h.level}` : `Hint Tier ${h.level}`} · {h.type}
                </span>
              </p>
              <MarkdownRenderer content={h.text_md} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // External problem layout
  if (problem.kind === 'external') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/problems')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{locale === 'vi' ? 'Kho bài tập' : 'Problems'}</span>
          </button>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            {t.reportIssue}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 tabular-nums">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {problem.source} {problem.source_id}
                </span>
                <span aria-hidden="true">·</span>
                <span>Cấp {problem.level}</span>
                <span aria-hidden="true">·</span>
                <span>{problem.difficulty}</span>
                {problem.cf_rating && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Rating {problem.cf_rating}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
                {problem.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {problem.topics.map((tp) => tp.name_vi).join(' · ')}
              </p>
            </div>
            <ProblemStatusLabel status={problem.my_progress.status} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {problem.source_url && (
              <a
                href={problem.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-400"
              >
                <span>{locale === 'vi' ? `Mở đề bài tại ${problem.source}` : `Open on ${problem.source}`}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              type="button"
              onClick={handleExternalTried}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {locale === 'vi'
                ? `Đã thử nộp ngoài (${problem.my_progress.attempts} lần)`
                : `Tried externally (${problem.my_progress.attempts})`}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">{problem.license_note}</p>

          <form
            onSubmit={handleSaveExternalMark}
            className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {locale === 'vi' ? 'Tự đánh dấu tiến độ & ghi chú cá nhân' : 'Self-Report Progress & Notes'}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="ext-status" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {locale === 'vi' ? 'Trạng thái' : 'Status'}
                </label>
                <select
                  id="ext-status"
                  value={extStatus}
                  onChange={(e) => setExtStatus(e.target.value as ProblemStatus)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="not_started">{t.probNotStarted}</option>
                  <option value="attempted">{t.probAttempted}</option>
                  <option value="solved">{t.probSolved}</option>
                  <option value="mastered">{t.probMastered}</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="ext-notes" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {locale === 'vi' ? 'Ghi chú thuật toán / bẫy' : 'Personal algorithm notes'}
                </label>
                <input
                  id="ext-notes"
                  type="text"
                  value={extNotes}
                  onChange={(e) => setExtNotes(e.target.value)}
                  placeholder={locale === 'vi' ? 'VD: Dùng hai con trỏ + sắp xếp...' : 'Notes...'}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              {extMsg ? <p className="text-xs text-emerald-700 dark:text-emerald-400">{extMsg}</p> : <span />}
              <button
                type="submit"
                disabled={savingExt}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50"
              >
                {savingExt ? (locale === 'vi' ? 'Đang lưu...' : 'Saving...') : locale === 'vi' ? 'Lưu tiến độ' : 'Save Progress'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            {locale === 'vi' ? 'Gợi ý 4 tầng' : '4-Tier Progressive Hints'}
          </h2>
          {renderHintsPanel()}
        </div>

        <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} defaultType="problem" defaultTargetId={problem.slug} />
      </div>
    );
  }

  // Native Split-Pane IDE Layout
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Compact bar above split IDE */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(contestSlug ? `/contests/${contestSlug}` : '/problems')}
            className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{contestSlug ? contestSlug : locale === 'vi' ? 'Kho bài tập' : 'Problems'}</span>
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white font-display">{problem.title}</h1>
          {contestSlug && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Contest: {contestSlug}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ProblemStatusLabel status={problem.my_progress.status} />
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            {t.reportIssue}
          </button>
        </div>
      </div>

      {/* Split IDE */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Left Pane: Statement / My Submissions / Progressive Hints */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            {(
              [
                { k: 'statement', label: locale === 'vi' ? 'Đề bài' : 'Statement' },
                { k: 'submissions', label: locale === 'vi' ? `Bài nộp (${mySubs.length})` : `Submissions (${mySubs.length})` },
                { k: 'hints', label: locale === 'vi' ? `Gợi ý (${problem.unlocked_hints.length}/${problem.total_hints})` : `Hints` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.k}
                type="button"
                onClick={() => setLeftTab(tab.k)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  leftTab === tab.k
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6 space-y-6 lg:max-h-[78vh] lg:overflow-y-auto">
            {leftTab === 'statement' && problem.native && (
              <>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800 tabular-nums">
                  <span>{locale === 'vi' ? `Cấp ${problem.level}` : `Level ${problem.level}`}</span>
                  <span aria-hidden="true">·</span>
                  <span>{problem.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>{problem.native.time_limit_ms} ms</span>
                  <span aria-hidden="true">·</span>
                  <span>{problem.native.memory_limit_mb} MB</span>
                  <span aria-hidden="true">·</span>
                  <span>Checker: {problem.native.checker}</span>
                  <span aria-hidden="true">·</span>
                  <span>{problem.native.tests_count} tests</span>
                </div>

                <MarkdownRenderer content={problem.native.statement_md} />

                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {locale === 'vi' ? 'Dữ liệu vào' : 'Input'}
                  </h2>
                  <MarkdownRenderer content={problem.native.input_spec_md} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {locale === 'vi' ? 'Kết quả ra' : 'Output'}
                  </h2>
                  <MarkdownRenderer content={problem.native.output_spec_md} />
                </div>

                <div className="space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {locale === 'vi' ? 'Ví dụ' : 'Samples'}
                  </h2>
                  {problem.native.samples.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800"
                    >
                      <div className="p-3 bg-slate-50 dark:bg-slate-950">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Input #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              void navigator.clipboard.writeText(s.input);
                              setCopiedSampleIdx(idx);
                              setTimeout(() => setCopiedSampleIdx(null), 1500);
                            }}
                            aria-label={`Copy sample input ${idx + 1}`}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          >
                            {copiedSampleIdx === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedSampleIdx === idx ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                          {s.input}
                        </pre>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950">
                        <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                          Output #{idx + 1}
                        </span>
                        <pre className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                          {s.output}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>

                {problem.native.notes_md && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      {locale === 'vi' ? 'Ghi chú' : 'Notes'}
                    </h2>
                    <MarkdownRenderer content={problem.native.notes_md} />
                  </div>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500">{problem.license_note}</p>
              </>
            )}

            {leftTab === 'submissions' && (
              <div className="space-y-3">
                {!user ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {locale === 'vi' ? 'Đăng nhập để xem lịch sử bài nộp.' : 'Sign in to view your submissions.'}
                  </p>
                ) : mySubs.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {locale === 'vi' ? 'Bạn chưa nộp bài nào cho bài tập này.' : 'No submissions yet for this problem.'}
                  </p>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {mySubs.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={async () => {
                          const detail = await apiFetch<SubmissionDetail>(`/submissions/${sub.id}`);
                          setLiveJudge({
                            submissionId: detail.id,
                            status: detail.status,
                            verdict: detail.verdict,
                            score: detail.score,
                            max_time_ms: detail.max_time_ms,
                            max_memory_kb: detail.max_memory_kb,
                            tests_passed: detail.tests_passed ?? 0,
                            tests_total: detail.tests_total ?? 0,
                            failed_test: detail.failed_test,
                            compile_log: detail.compile_log,
                            tests: detail.tests || [],
                          });
                        }}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 tabular-nums"
                      >
                        <div>
                          <VerdictBadge verdict={sub.verdict} status={sub.status} />
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                            #{sub.id} · {sub.language} · {formatVnDateTime(sub.submitted_at)}
                          </p>
                        </div>
                        <div className="text-right text-slate-600 dark:text-slate-300">
                          <p>
                            {sub.tests_passed ?? 0}/{sub.tests_total ?? 0} tests
                          </p>
                          <p>{sub.max_time_ms ?? 0} ms</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {leftTab === 'hints' && renderHintsPanel()}
          </div>
        </div>

        {/* Right Pane: Code Editor + Submit + Live SSE Verdict Panel */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="lang-select" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {locale === 'vi' ? 'Ngôn ngữ:' : 'Language:'}
              </label>
              <select
                id="lang-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'cpp17' | 'python3')}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100"
              >
                {(problem.native?.allowed_languages || ['cpp17', 'python3']).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang === 'cpp17' ? 'C++17 (GCC)' : 'Python 3.10'}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmitCode}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4" />
              <span>{submitting ? t.submitting : t.submitCode}</span>
            </button>
          </div>

          {submitErr && (
            <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
              {submitErr}
            </div>
          )}

          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={language}
            onReset={() => handleCodeChange(DEFAULT_TEMPLATES[language])}
            onSubmitShortcut={handleSubmitCode}
          />

          {/* Live Judge Output Panel */}
          {liveJudge && (
            <div
              data-testid="judge-result-panel"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 tabular-nums">
                <div className="flex items-center gap-3">
                  <VerdictBadge verdict={liveJudge.verdict} status={liveJudge.status} />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    #{liveJudge.submissionId}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-3">
                  <span>
                    {liveJudge.tests_passed}/{liveJudge.tests_total} tests
                  </span>
                  <span>{liveJudge.score}/100</span>
                  {liveJudge.max_time_ms !== null && <span>{liveJudge.max_time_ms} ms</span>}
                </div>
              </div>

              {liveJudge.compile_log && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-rose-300 p-3 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                  {liveJudge.compile_log}
                </div>
              )}

              {liveJudge.tests.length > 0 && (
                <div className="space-y-3">
                  <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-xs text-left border-collapse tabular-nums">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-3 py-2 font-medium">Test</th>
                          <th className="px-3 py-2 font-medium">Verdict</th>
                          <th className="px-3 py-2 font-medium text-right">Time</th>
                          <th className="px-3 py-2 font-medium">{locale === 'vi' ? 'Chi tiết' : 'Message'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {liveJudge.tests.map((tr) => (
                          <tr key={tr.test_name}>
                            <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">
                              {tr.test_name} {tr.is_sample ? '(sample)' : ''}
                            </td>
                            <td className="px-3 py-1.5">
                              <VerdictBadge verdict={tr.verdict} compact />
                            </td>
                            <td className="px-3 py-1.5 text-right text-slate-500 dark:text-slate-400">
                              {tr.time_ms} ms
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                              {tr.checker_msg}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Sample diff preview if a sample failed */}
                  {liveJudge.tests
                    .filter((tr) => tr.is_sample && tr.verdict !== 'AC' && (tr.stdout_preview !== null || tr.expected_preview !== null))
                    .map((tr) => (
                      <div
                        key={`diff-${tr.test_name}`}
                        className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 p-3 space-y-2 text-xs"
                      >
                        <p className="font-semibold text-rose-700 dark:text-rose-400">
                          {locale === 'vi' ? `So sánh test mẫu ${tr.test_name}:` : `Sample ${tr.test_name} Diff:`}
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 font-mono">
                          <div>
                            <p className="text-slate-500 mb-1">Output của bạn:</p>
                            <pre className="p-2 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                              {tr.stdout_preview || '(empty)'}
                            </pre>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Đáp án chuẩn:</p>
                            <pre className="p-2 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                              {tr.expected_preview || '(empty)'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} defaultType="problem" defaultTargetId={problem.slug} />
    </div>
  );
}
