import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, RefreshCw, Trophy } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import { formatVnDateTime } from '../lib/i18n';
import { useApp } from '../context/AppContext';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import type { ContestItem } from '../types/duckoj';

interface StandingRow {
  rank: number;
  user_id: number;
  handle: string;
  name: string;
  solved_count: number;
  penalty: number;
  problems: Record<string, { label: string; solved: boolean; wrong_attempts: number; ac_minutes: number | null }>;
}

export function ContestDetailPage({ slug }: { slug: string }) {
  const { user, locale, navigate } = useApp();
  const [contest, setContest] = useState<ContestItem | null>(null);
  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, st] = await Promise.all([
        apiFetch<ContestItem>(`/contests/${encodeURIComponent(slug)}`),
        apiFetch<{ items: StandingRow[] }>(`/contests/${encodeURIComponent(slug)}/standings`),
      ]);
      setContest(c);
      setStandings(st.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tải kỳ thi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, [slug]);

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setJoining(true);
    try {
      await apiFetch(`/contests/${encodeURIComponent(slug)}/join`, { method: 'POST' });
      await loadAll();
    } catch {
      // ignore
    } finally {
      setJoining(false);
    }
  };

  const refreshStandings = async () => {
    try {
      const st = await apiFetch<{ items: StandingRow[] }>(`/contests/${encodeURIComponent(slug)}/standings`);
      setStandings(st.items);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <div className="h-12 w-64 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <p className="text-rose-600 dark:text-rose-400">{error || 'Không tìm thấy contest.'}</p>
        <button
          type="button"
          onClick={() => navigate('/contests')}
          className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium"
        >
          {locale === 'vi' ? 'Danh sách kỳ thi' : 'Back to contests'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <button
        type="button"
        onClick={() => navigate('/contests')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{locale === 'vi' ? 'Danh sách kỳ thi' : 'All Contests'}</span>
      </button>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1 tabular-nums">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                <Trophy className="w-3.5 h-3.5" />
                <span>{contest.scoring.toUpperCase()}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {formatVnDateTime(contest.start_at)} → {formatVnDateTime(contest.end_at)}
              </span>
              <span aria-hidden="true">·</span>
              <span>Phạt {contest.penalty_minutes} phút/lần sai</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
              {contest.title}
            </h1>
          </div>

          <div className="shrink-0">
            {contest.joined ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{locale === 'vi' ? 'Đã tham gia' : 'Joined'}</span>
              </span>
            ) : (
              <button
                type="button"
                disabled={joining}
                onClick={handleJoin}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50"
              >
                {joining
                  ? locale === 'vi'
                    ? 'Đang ghi danh...'
                    : 'Joining...'
                  : locale === 'vi'
                    ? 'Đăng ký tham gia'
                    : 'Join Contest'}
              </button>
            )}
          </div>
        </div>

        <MarkdownRenderer content={contest.description_md} />
      </div>

      {/* Problems List */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
          {locale === 'vi' ? 'Danh sách bài thi' : 'Contest Problems'}
        </h2>
        {contest.phase === 'upcoming' && (!contest.problems || contest.problems.length === 0) ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {locale === 'vi'
                ? `Đề bài sẽ được mở khóa tự động khi kỳ thi bắt đầu (${formatVnDateTime(contest.start_at)}).`
                : `Problem statements are locked until contest start (${formatVnDateTime(contest.start_at)}).`}
            </span>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <table className="w-full text-sm text-left border-collapse tabular-nums">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Mã</th>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Tên bài' : 'Problem'}</th>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Giới hạn' : 'Limits'}</th>
                  <th className="px-4 py-3 font-medium text-right">{locale === 'vi' ? 'Thao tác' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {(contest.problems || []).map((p) => (
                  <tr key={p.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-amber-700 dark:text-amber-400">{p.label}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{p.title}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {p.time_limit_ms} ms · {p.memory_limit_mb} MB
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/problems/${p.slug}?contest=${contest.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/problems/${p.slug}?contest=${contest.slug}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold"
                      >
                        {locale === 'vi' ? 'Giải bài' : 'Solve'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Standings */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
            {locale === 'vi' ? 'Bảng xếp hạng ICPC' : 'ICPC Standings'}
          </h2>
          <button
            type="button"
            onClick={refreshStandings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{locale === 'vi' ? 'Làm mới' : 'Refresh'}</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          {standings.length === 0 ? (
            <p className="p-6 text-sm text-slate-500 dark:text-slate-400">
              {locale === 'vi' ? 'Chưa có thí sinh tham gia.' : 'No participants yet.'}
            </p>
          ) : (
            <table className="w-full text-sm text-left border-collapse tabular-nums">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Thí sinh' : 'Participant'}</th>
                  <th className="px-4 py-3 font-medium text-right">Solved</th>
                  <th className="px-4 py-3 font-medium text-right">Penalty</th>
                  {(contest.problems || []).map((p) => (
                    <th key={p.label} className="px-3 py-3 font-mono font-semibold text-center">
                      {p.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {standings.map((row) => (
                  <tr key={row.user_id}>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {row.rank}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">@{row.handle}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">{row.solved_count}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">{row.penalty}</td>
                    {(contest.problems || []).map((p) => {
                      const cell = row.problems[p.label];
                      if (!cell || (!cell.solved && cell.wrong_attempts === 0)) {
                        return (
                          <td key={p.label} className="px-3 py-3 text-center text-slate-400">
                            —
                          </td>
                        );
                      }
                      if (cell.solved) {
                        const wrong = cell.wrong_attempts;
                        return (
                          <td
                            key={p.label}
                            className="px-3 py-3 text-center font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                          >
                            +{wrong > 0 ? wrong : ''} ({cell.ac_minutes ?? 0}m)
                          </td>
                        );
                      }
                      return (
                        <td
                          key={p.label}
                          className="px-3 py-3 text-center font-mono text-xs text-rose-600 dark:text-rose-400"
                        >
                          -{cell.wrong_attempts}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
