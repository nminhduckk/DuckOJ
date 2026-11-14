import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Code2, Eye, X } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import { formatVnDateTime } from '../lib/i18n';
import { VerdictBadge } from '../components/VerdictBadge';
import type { SubmissionDetail, Verdict } from '../types/duckoj';

interface SubmissionFeedRow {
  id: number;
  language: 'cpp17' | 'python3';
  status: 'queued' | 'judging' | 'done' | 'system_error';
  verdict: Verdict | null;
  score: number;
  max_time_ms: number | null;
  max_memory_kb: number | null;
  tests_passed: number | null;
  tests_total: number | null;
  submitted_at: string;
  problem_slug: string;
  problem_title: string;
  user_handle?: string;
  is_mine?: number;
}

export function SubmissionsPage() {
  const { user, locale, navigate } = useApp();
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [verdictFilter, setVerdictFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<SubmissionFeedRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const pageSize = 20;

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      if (scope === 'mine' && user) {
        const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
        if (verdictFilter) params.set('verdict', verdictFilter);
        const res = await apiFetch<{ items: SubmissionFeedRow[]; total: number }>(`/me/submissions?${params.toString()}`);
        setItems(res.items.map((r) => ({ ...r, user_handle: user.handle, is_mine: 1 })));
        setTotal(res.total);
      } else {
        const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
        const res = await apiFetch<{ items: SubmissionFeedRow[]; total: number }>(`/submissions?${params.toString()}`);
        setItems(res.items);
        setTotal(res.total);
      }
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, scope, user, verdictFilter]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const openDetail = async (id: number) => {
    setDetailError('');
    setDetailLoading(true);
    try {
      const detail = await apiFetch<SubmissionDetail>(`/submissions/${id}`);
      setSelected(detail);
    } catch (err: any) {
      setDetailError(err?.message || (locale === 'vi' ? 'Không thể tải chi tiết bài nộp.' : 'Failed to load submission.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const isStaff = user && (user.role === 'admin' || user.role === 'reviewer');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
            {locale === 'vi' ? 'Nhật ký bài nộp' : 'Submissions Feed'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {locale === 'vi'
              ? 'Theo dõi trạng thái chấm bài theo thời gian thực trên máy chấm DuckOJ.'
              : 'Live queue and verdict stream across DuckOJ native problems.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user && (
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => {
                  setScope('all');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  scope === 'all'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {locale === 'vi' ? 'Tất cả' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope('mine');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  scope === 'mine'
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {locale === 'vi' ? 'Của tôi' : 'My Submissions'}
              </button>
            </div>
          )}

          {scope === 'mine' && user && (
            <select
              value={verdictFilter}
              onChange={(e) => {
                setVerdictFilter(e.target.value);
                setPage(1);
              }}
              aria-label={locale === 'vi' ? 'Lọc kết quả' : 'Filter verdict'}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-100"
            >
              <option value="">{locale === 'vi' ? 'Mọi kết quả' : 'All verdicts'}</option>
              {(['AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'OLE'] as const).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {detailError && (
        <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
          {detailError}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">#</th>
                <th className="py-3 px-4 font-semibold">{locale === 'vi' ? 'Thời gian' : 'Submitted'}</th>
                <th className="py-3 px-4 font-semibold">{locale === 'vi' ? 'Thành viên' : 'User'}</th>
                <th className="py-3 px-4 font-semibold">{locale === 'vi' ? 'Bài tập' : 'Problem'}</th>
                <th className="py-3 px-4 font-semibold">{locale === 'vi' ? 'Ngôn ngữ' : 'Lang'}</th>
                <th className="py-3 px-4 font-semibold">{locale === 'vi' ? 'Kết quả' : 'Verdict'}</th>
                <th className="py-3 px-4 font-semibold text-right">Test</th>
                <th className="py-3 px-4 font-semibold text-right">{locale === 'vi' ? 'Thời gian chạy' : 'Time'}</th>
                <th className="py-3 px-4 font-semibold text-right">{locale === 'vi' ? 'Chi tiết' : 'Code'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="py-4 px-4">
                      <div className="h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 px-4 text-center text-slate-500 dark:text-slate-400">
                    {locale === 'vi' ? 'Chưa có bài nộp nào.' : 'No submissions found.'}
                  </td>
                </tr>
              ) : (
                items.map((row) => {
                  const canView = Boolean(row.is_mine) || Boolean(isStaff);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {row.id}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {formatVnDateTime(row.submitted_at)}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        @{row.user_handle || user?.handle || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`/problems/${row.problem_slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/problems/${row.problem_slug}`);
                          }}
                          className="font-medium text-slate-900 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 hover:underline"
                        >
                          {row.problem_title}
                        </a>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {row.language === 'cpp17' ? 'C++17' : 'Python 3'}
                      </td>
                      <td className="py-3 px-4">
                        <VerdictBadge verdict={row.verdict} status={row.status} compact />
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {row.tests_total != null ? `${row.tests_passed ?? 0}/${row.tests_total}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {row.max_time_ms != null ? `${row.max_time_ms} ms` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canView ? (
                          <button
                            type="button"
                            onClick={() => openDetail(row.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{locale === 'vi' ? 'Xem' : 'View'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span className="tabular-nums">
              {locale === 'vi' ? `Trang ${page} / ${totalPages} (${total} bài nộp)` : `Page ${page} / ${totalPages} (${total} total)`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{locale === 'vi' ? 'Trước' : 'Prev'}</span>
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span>{locale === 'vi' ? 'Sau' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {(selected || detailLoading) && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3 min-w-0">
                <Code2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {selected ? `#${selected.id} · ${selected.problem_title}` : locale === 'vi' ? 'Đang tải...' : 'Loading...'}
                  </h2>
                  {selected && (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>@{selected.user_handle}</span>
                      <VerdictBadge verdict={selected.verdict} status={selected.status} />
                      <span className="tabular-nums">
                        {selected.score}/100 ({selected.tests_passed ?? 0}/{selected.tests_total ?? 0})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {detailLoading && !selected ? (
              <div className="p-8 text-center text-sm text-slate-500">
                {locale === 'vi' ? 'Đang tải chi tiết...' : 'Loading details...'}
              </div>
            ) : selected ? (
              <div className="p-5 space-y-5">
                {selected.compile_log && (
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {locale === 'vi' ? 'Nhật ký biên dịch' : 'Compiler Output'}
                    </p>
                    <pre className="text-xs font-mono text-rose-700 dark:text-rose-300 whitespace-pre-wrap overflow-x-auto">
                      {selected.compile_log}
                    </pre>
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    {locale === 'vi' ? 'Mã nguồn' : 'Source Code'} ({selected.language === 'cpp17' ? 'C++17' : 'Python 3'})
                  </p>
                  <pre className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
                    {selected.source_code}
                  </pre>
                </div>

                {selected.tests && selected.tests.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      {locale === 'vi' ? 'Chi tiết từng test' : 'Test Case Results'}
                    </p>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {selected.tests.map((tr) => (
                        <div
                          key={tr.ord}
                          className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{tr.test_name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-slate-500 tabular-nums">{tr.time_ms}ms</span>
                            <VerdictBadge verdict={tr.verdict} compact />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
