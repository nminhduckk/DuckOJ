import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Cpu, FileWarning, Play, RefreshCw, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import { formatVnDateTime } from '../lib/i18n';

interface QueueRow {
  lesson_id: number;
  problem_id: number;
  tier: string;
  review_status: string;
  topic_fit: string;
  reviewer_note: string | null;
  lesson_code: string;
  lesson_slug: string;
  lesson_title: string;
  track_id: number;
  problem_slug: string;
  problem_title: string;
  source: string;
  source_id: string;
  source_url: string | null;
  cf_rating: number | null;
  kind: string;
}

interface LessonStatRow {
  lesson_id: number;
  lesson_code: string;
  title: string;
  track_id: number;
  approved: number;
  native_count: number;
  weak_count: number;
  pending_count: number;
  auto_rejected_count: number;
}

interface SelftestReport {
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  stabilityStdDevPct: number;
  results: {
    id: string;
    name: string;
    expected: string;
    actual: string;
    passed: boolean;
    time_ms: number;
    memory_kb: number;
    detail: string;
  }[];
}

export function AdminPage() {
  const { user, locale, navigate } = useApp();
  const [tab, setTab] = useState<'queue' | 'stats' | 'judge' | 'reports'>('queue');

  // Queue state
  const [flagFilter, setFlagFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [queue, setQueue] = useState<QueueRow[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [noteByKey, setNoteByKey] = useState<Record<string, string>>({});
  const [actionMsg, setActionMsg] = useState('');

  // Stats state
  const [lessonStats, setLessonStats] = useState<LessonStatRow[]>([]);
  const [meets5, setMeets5] = useState(0);
  const [totalLessons, setTotalLessons] = useState(74);
  const [statsQuery, setStatsQuery] = useState('');

  // Selftest & admin tools
  const [selftest, setSelftest] = useState<SelftestReport | null>(null);
  const [selftestRunning, setSelftestRunning] = useState(false);
  const [rejudgeId, setRejudgeId] = useState('');
  const [rejudgeMsg, setRejudgeMsg] = useState('');
  const [testSlug, setTestSlug] = useState('nat-sum-diff');
  const [testJsonInput, setTestJsonInput] = useState('');
  const [testUploadMsg, setTestUploadMsg] = useState('');

  // Reports & Audit
  const [reports, setReports] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const isStaff = user && (user.role === 'reviewer' || user.role === 'admin');

  const loadQueue = useCallback(async () => {
    if (!isStaff) return;
    setQueueLoading(true);
    try {
      const res = await apiFetch<{ items: QueueRow[] }>(
        `/admin/review/queue?flag=${encodeURIComponent(flagFilter)}&status=${encodeURIComponent(statusFilter)}`
      );
      setQueue(res.items);
    } finally {
      setQueueLoading(false);
    }
  }, [flagFilter, isStaff, statusFilter]);

  const loadStats = useCallback(async () => {
    if (!isStaff) return;
    const res = await apiFetch<{ items: LessonStatRow[]; meets_5_count: number; total_lessons: number }>(
      '/admin/seed/stats'
    );
    setLessonStats(res.items);
    setMeets5(res.meets_5_count);
    setTotalLessons(res.total_lessons);
  }, [isStaff]);

  const loadReportsAndAudit = useCallback(async () => {
    if (!isStaff) return;
    const [repRes, audRes] = await Promise.all([
      apiFetch<{ items: any[] }>('/admin/reports'),
      apiFetch<{ items: any[] }>('/admin/audit-log'),
    ]);
    setReports(repRes.items);
    setAuditLogs(audRes.items);
  }, [isStaff]);

  useEffect(() => {
    if (!isStaff) return;
    if (tab === 'queue') void loadQueue();
    if (tab === 'stats') void loadStats();
    if (tab === 'reports') void loadReportsAndAudit();
  }, [isStaff, loadQueue, loadReportsAndAudit, loadStats, tab]);

  if (!isStaff) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
          {locale === 'vi' ? 'Khu vực dành cho Reviewer & Admin' : 'Reviewer & Admin Access Only'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {locale === 'vi'
            ? 'Vui lòng đăng nhập bằng tài khoản có quyền Reviewer hoặc Admin để truy cập hàng đợi duyệt bài và máy chấm.'
            : 'Sign in with a Reviewer or Admin account to inspect the moderation queue and judge diagnostics.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold"
        >
          {locale === 'vi' ? 'Đến trang đăng nhập' : 'Go to Sign in'}
        </button>
      </div>
    );
  }

  const handleReviewDecision = async (
    row: QueueRow,
    decision: 'approve' | 'reject' | 'request_changes' | 'restore_pending'
  ) => {
    const key = `${row.lesson_id}:${row.problem_id}`;
    const note = (noteByKey[key] || '').trim();
    if (decision !== 'approve' && !note) {
      setActionMsg(locale === 'vi' ? 'Cần nhập ghi chú khi từ chối hoặc yêu cầu sửa.' : 'Note is required for non-approve actions.');
      return;
    }
    setActionMsg('');
    try {
      await apiFetch(`/admin/review/lesson_problem/${key}`, {
        method: 'POST',
        body: JSON.stringify({ decision, note: note || undefined }),
      });
      setActionMsg(`${row.lesson_code} · ${row.problem_slug} → ${decision}`);
      await loadQueue();
    } catch (err: any) {
      setActionMsg(err?.message || 'Review update failed');
    }
  };

  const handleRunSelftest = async () => {
    setSelftestRunning(true);
    try {
      const report = await apiFetch<SelftestReport>('/admin/judge/selftest', { method: 'POST' });
      setSelftest(report);
    } finally {
      setSelftestRunning(false);
    }
  };

  const handleRejudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setRejudgeMsg('');
    try {
      const res = await apiFetch<{ ok: boolean; id: number; status: string }>(
        `/admin/submissions/${Number(rejudgeId)}/rejudge`,
        { method: 'POST' }
      );
      setRejudgeMsg(`Submission #${res.id} → ${res.status}`);
    } catch (err: any) {
      setRejudgeMsg(err?.message || 'Rejudge error');
    }
  };

  const handleUploadTests = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestUploadMsg('');
    try {
      const parsed = JSON.parse(testJsonInput);
      const res = await apiFetch<{ version: number; tests_count: number }>(
        `/admin/problems/${encodeURIComponent(testSlug)}/test-sets`,
        { method: 'POST', body: JSON.stringify({ tests: parsed }) }
      );
      setTestUploadMsg(`Uploaded v${res.version} (${res.tests_count} tests)`);
    } catch (err: any) {
      setTestUploadMsg(err?.message || 'JSON hoặc dữ liệu test không hợp lệ.');
    }
  };

  const handleReportStatus = async (id: number, status: 'resolved' | 'dismissed', archive_target = false) => {
    await apiFetch(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, archive_target }),
    });
    await loadReportsAndAudit();
  };

  const filteredStats = lessonStats.filter(
    (s) =>
      !statsQuery.trim() ||
      s.lesson_code.toLowerCase().includes(statsQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(statsQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <p className="text-xs font-mono text-amber-700 dark:text-amber-400">
            @{user.handle} · {user.role.toUpperCase()}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display mt-1">
            {locale === 'vi' ? 'Bảng điều khiển Reviewer & Admin' : 'Moderation & Judge Console'}
          </h1>
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1">
          {[
            { id: 'queue', label: locale === 'vi' ? 'Hàng đợi duyệt' : 'Review Queue' },
            { id: 'stats', label: locale === 'vi' ? 'Thống kê 74 bài' : 'Lesson Coverage' },
            { id: 'judge', label: locale === 'vi' ? 'Máy chấm & Test' : 'Judge Selftest' },
            { id: 'reports', label: locale === 'vi' ? 'Báo cáo & Audit' : 'Reports & Audit' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                tab === item.id
                  ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: REVIEW QUEUE */}
      {tab === 'queue' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter review status"
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
              >
                <option value="pending">{locale === 'vi' ? 'Chờ duyệt (pending)' : 'Pending'}</option>
                <option value="auto_rejected">{locale === 'vi' ? 'Tự động loại (auto_rejected)' : 'Auto-rejected'}</option>
                <option value="approved">{locale === 'vi' ? 'Đã duyệt (approved)' : 'Approved'}</option>
                <option value="rejected">{locale === 'vi' ? 'Đã từ chối (rejected)' : 'Rejected'}</option>
                <option value="all">{locale === 'vi' ? 'Tất cả trạng thái' : 'All statuses'}</option>
              </select>

              <select
                value={flagFilter}
                onChange={(e) => setFlagFilter(e.target.value)}
                aria-label="Filter topic fit flag"
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
              >
                <option value="all">{locale === 'vi' ? 'Mọi mức độ khớp chủ đề' : 'All topic fits'}</option>
                <option value="yellow">{locale === 'vi' ? 'Cờ vàng (weak)' : 'Yellow flag (weak)'}</option>
                <option value="red">{locale === 'vi' ? 'Cờ đỏ (none)' : 'Red flag (none)'}</option>
                <option value="auto_rejected">{locale === 'vi' ? 'Auto-rejected' : 'Auto-rejected'}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => loadQueue()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{locale === 'vi' ? 'Làm mới' : 'Refresh'}</span>
            </button>
          </div>

          {actionMsg && (
            <div className="rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-200">
              {actionMsg}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs uppercase text-slate-500">
                    <th className="py-3 px-4">{locale === 'vi' ? 'Bài học' : 'Lesson'}</th>
                    <th className="py-3 px-4">{locale === 'vi' ? 'Bài tập' : 'Problem'}</th>
                    <th className="py-3 px-4">Fit</th>
                    <th className="py-3 px-4">{locale === 'vi' ? 'Trạng thái' : 'Status'}</th>
                    <th className="py-3 px-4">{locale === 'vi' ? 'Ghi chú' : 'Note'}</th>
                    <th className="py-3 px-4 text-right">{locale === 'vi' ? 'Thao tác' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {queueLoading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                        {locale === 'vi' ? 'Đang tải hàng đợi...' : 'Loading queue...'}
                      </td>
                    </tr>
                  ) : queue.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-slate-500">
                        {locale === 'vi' ? 'Không có mục nào trong bộ lọc này.' : 'No items match this filter.'}
                      </td>
                    </tr>
                  ) : (
                    queue.map((row) => {
                      const key = `${row.lesson_id}:${row.problem_id}`;
                      return (
                        <tr key={key} className="align-top">
                          <td className="py-3 px-4 text-xs">
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                              {row.lesson_code}
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{row.lesson_title}</p>
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <a
                              href={`/problems/${row.problem_slug}`}
                              onClick={(e) => {
                                e.preventDefault();
                                navigate(`/problems/${row.problem_slug}`);
                              }}
                              className="font-medium text-slate-900 dark:text-slate-100 hover:underline"
                            >
                              {row.problem_title}
                            </a>
                            <p className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                              {row.source} · {row.tier}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono">
                            <span
                              className={
                                row.topic_fit === 'none'
                                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                  : row.topic_fit === 'weak'
                                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                    : 'text-emerald-700 dark:text-emerald-400'
                              }
                            >
                              {row.topic_fit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-slate-700 dark:text-slate-300">
                            {row.review_status}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder={row.reviewer_note || (locale === 'vi' ? 'Ghi chú duyệt...' : 'Review note...')}
                              value={noteByKey[key] ?? ''}
                              onChange={(e) => setNoteByKey((prev) => ({ ...prev, [key]: e.target.value }))}
                              className="w-44 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs"
                            />
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleReviewDecision(row, 'approve')}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewDecision(row, 'reject')}
                              className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-medium hover:bg-rose-700"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: V_LESSON_STATS */}
      {tab === 'stats' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm font-medium text-slate-900 dark:text-white tabular-nums">
                {locale === 'vi'
                  ? `Đạt chuẩn >= 5 bài đã duyệt: ${meets5} / ${totalLessons} bài học`
                  : `Lessons meeting >= 5 approved problems: ${meets5} / ${totalLessons}`}
              </p>
            </div>
            <input
              type="text"
              placeholder={locale === 'vi' ? 'Tìm theo mã hoặc tên bài...' : 'Filter by code or title...'}
              value={statsQuery}
              onChange={(e) => setStatsQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs w-64"
            />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 uppercase text-slate-500">
                    <th className="py-2.5 px-4">Code</th>
                    <th className="py-2.5 px-4">{locale === 'vi' ? 'Bài học' : 'Lesson'}</th>
                    <th className="py-2.5 px-4 text-right">Approved</th>
                    <th className="py-2.5 px-4 text-right">Native</th>
                    <th className="py-2.5 px-4 text-right">Weak</th>
                    <th className="py-2.5 px-4 text-right">Pending</th>
                    <th className="py-2.5 px-4 text-right">Auto-Rej</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStats.map((s) => (
                    <tr key={s.lesson_id}>
                      <td className="py-2 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {s.lesson_code}
                      </td>
                      <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{s.title}</td>
                      <td className="py-2 px-4 text-right font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {s.approved}
                      </td>
                      <td className="py-2 px-4 text-right font-mono tabular-nums">{s.native_count}</td>
                      <td className="py-2 px-4 text-right font-mono tabular-nums text-amber-600">{s.weak_count}</td>
                      <td className="py-2 px-4 text-right font-mono tabular-nums">{s.pending_count}</td>
                      <td className="py-2 px-4 text-right font-mono tabular-nums text-rose-600">{s.auto_rejected_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JUDGE SELFTEST & TEST SETS */}
      {tab === 'judge' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{locale === 'vi' ? 'Kiểm thử máy chấm 17 ca chuẩn' : '17-Case Judge Selftest Suite'}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {locale === 'vi'
                    ? 'Chạy trực tiếp trên sandbox với toàn bộ ca AC, WA, CE, TLE, MLE, RE, OLE và chống vượt rào.'
                    : 'Executes live sandbox verification across AC, WA, CE, TLE, MLE, RE, OLE, and security isolation.'}
                </p>
              </div>
              <button
                type="button"
                disabled={selftestRunning}
                onClick={handleRunSelftest}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{selftestRunning ? (locale === 'vi' ? 'Đang chạy 17 ca...' : 'Running...') : locale === 'vi' ? 'Chạy Selftest' : 'Run Selftest'}</span>
              </button>
            </div>

            {selftest && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <span className={selftest.allPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}>
                    {selftest.passedCount} / {selftest.totalCount} PASS
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Stability StdDev: {selftest.stabilityStdDevPct.toFixed(1)}%
                  </span>
                </div>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-500">
                        <th className="py-2 px-3">Case</th>
                        <th className="py-2 px-3">Expected</th>
                        <th className="py-2 px-3">Actual</th>
                        <th className="py-2 px-3 text-right">Time</th>
                        <th className="py-2 px-3 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selftest.results.map((r) => (
                        <tr key={r.id}>
                          <td className="py-2 px-3">
                            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{r.id}</span>
                            <p className="text-slate-500 truncate max-w-xs">{r.name}</p>
                          </td>
                          <td className="py-2 px-3 font-mono">{r.expected}</td>
                          <td className="py-2 px-3 font-mono">{r.actual}</td>
                          <td className="py-2 px-3 text-right font-mono tabular-nums">{r.time_ms} ms</td>
                          <td className="py-2 px-3 text-right">
                            {r.passed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">
                                <XCircle className="w-3.5 h-3.5" /> FAIL
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {user.role === 'admin' && (
            <div className="grid md:grid-cols-2 gap-6">
              <form
                onSubmit={handleRejudge}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {locale === 'vi' ? 'Chấm lại bài nộp (Rejudge)' : 'Rejudge Submission'}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="Submission ID"
                    value={rejudgeId}
                    onChange={(e) => setRejudgeId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold"
                  >
                    Rejudge
                  </button>
                </div>
                {rejudgeMsg && <p className="text-xs text-amber-700 dark:text-amber-400 font-mono">{rejudgeMsg}</p>}
              </form>

              <form
                onSubmit={handleUploadTests}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {locale === 'vi' ? 'Cập nhật bộ test (JSON)' : 'Upload Test Set (JSON)'}
                </h3>
                <input
                  type="text"
                  required
                  value={testSlug}
                  onChange={(e) => setTestSlug(e.target.value)}
                  placeholder="Problem slug (e.g. nat-sum-diff)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
                />
                <textarea
                  rows={3}
                  required
                  value={testJsonInput}
                  onChange={(e) => setTestJsonInput(e.target.value)}
                  placeholder='[{"grp":"sample","is_sample":true,"input":"3 4\n","expected":"7 -1"}]'
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold"
                >
                  {locale === 'vi' ? 'Tạo phiên bản test mới' : 'Create Test Version'}
                </button>
                {testUploadMsg && <p className="text-xs text-amber-700 dark:text-amber-400 font-mono">{testUploadMsg}</p>}
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REPORTS & AUDIT */}
      {tab === 'reports' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-amber-600" />
              <span>{locale === 'vi' ? 'Báo cáo từ người dùng' : 'User Reports'}</span>
            </h2>
            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">{locale === 'vi' ? 'Chưa có báo cáo nào.' : 'No reports yet.'}</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((rep) => (
                  <div key={rep.id} className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        #{rep.id} · {rep.target_type}:{rep.target_id}
                      </span>
                      <span className="font-mono text-slate-500">{rep.status}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{rep.message}</p>
                    {rep.status === 'open' && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleReportStatus(rep.id, 'resolved', false)}
                          className="px-2.5 py-1 rounded bg-emerald-600 text-white font-medium"
                        >
                          Resolve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReportStatus(rep.id, 'dismissed', false)}
                          className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 font-medium"
                        >
                          Dismiss
                        </button>
                        {(rep.target_type === 'copyright' || rep.target_type === 'problem') && (
                          <button
                            type="button"
                            onClick={() => handleReportStatus(rep.id, 'resolved', true)}
                            className="px-2.5 py-1 rounded bg-rose-600 text-white font-medium"
                          >
                            Resolve & Archive Target
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {locale === 'vi' ? 'Nhật ký kiểm duyệt (Audit Log)' : 'Audit Log'}
            </h2>
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">{locale === 'vi' ? 'Chưa có thao tác nào.' : 'No audit events.'}</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        @{log.actor_handle || 'system'} · {log.action}
                      </span>
                      <span className="text-slate-400 tabular-nums">{formatVnDateTime(log.created_at)}</span>
                    </div>
                    <p className="font-mono text-slate-500">
                      {log.entity}:{log.entity_id} {log.diff || ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
