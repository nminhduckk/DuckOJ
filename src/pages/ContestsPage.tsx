import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Trophy, Users } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { formatVnDateTime } from '../lib/i18n';
import { useApp } from '../context/AppContext';
import type { ContestItem } from '../types/duckoj';

export function ContestsPage() {
  const { locale, navigate } = useApp();
  const [contests, setContests] = useState<ContestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<{ items: ContestItem[] }>('/contests')
      .then((res) => {
        if (active) setContests(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const phaseLabel = (phase: ContestItem['phase']) => {
    if (phase === 'running') {
      return {
        text: locale === 'vi' ? 'Đang diễn ra' : 'Running',
        cls: 'text-emerald-700 dark:text-emerald-400',
      };
    }
    if (phase === 'upcoming') {
      return {
        text: locale === 'vi' ? 'Sắp diễn ra' : 'Upcoming',
        cls: 'text-amber-700 dark:text-amber-400',
      };
    }
    return {
      text: locale === 'vi' ? 'Đã kết thúc' : 'Ended',
      cls: 'text-slate-500 dark:text-slate-400',
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
          {locale === 'vi' ? 'Kỳ thi lập trình DuckOJ' : 'DuckOJ Contests'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {locale === 'vi'
            ? 'Thử sức trong thời gian thực theo thể thức ICPC chuẩn với bảng xếp hạng cập nhật trực tiếp.'
            : 'Compete in ICPC-format timed rounds with live penalty standings.'}
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="h-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : contests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500">
          {locale === 'vi' ? 'Chưa có kỳ thi nào được mở.' : 'No public contests available.'}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {contests.map((c) => {
            const ph = phaseLabel(c.phase);
            return (
              <div
                key={c.slug}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs tabular-nums">
                    <span className={`inline-flex items-center gap-1.5 font-semibold ${ph.cls}`}>
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{ph.text}</span>
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">
                      {c.scoring.toUpperCase()} · {locale === 'vi' ? `+${c.penalty_minutes} phút` : `+${c.penalty_minutes}m`}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">{c.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatVnDateTime(c.start_at)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatVnDateTime(c.end_at)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {c.participant_count} {locale === 'vi' ? 'thí sinh' : 'participants'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {c.problem_count ?? 0} {locale === 'vi' ? 'bài tập' : 'problems'}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(`/contests/${c.slug}`)}
                    className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-400"
                  >
                    {locale === 'vi' ? 'Vào phòng thi' : 'Enter Contest'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
