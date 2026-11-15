import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { formatTopic, formatTrack } from '../lib/i18n';
import { useApp } from '../context/AppContext';
import { LessonStatusLabel } from '../components/VerdictBadge';
import type { RoadmapNode, TrackItem } from '../types/duckoj';

export function LearnPage() {
  const { locale, search, navigate } = useApp();
  const initialLevel = useMemo(() => {
    const sp = new URLSearchParams(search);
    const lv = sp.get('level');
    return lv !== null && lv !== '' ? Number(lv) : null;
  }, [search]);

  const [levelFilter, setLevelFilter] = useState<number | null>(initialLevel);
  const [query, setQuery] = useState('');
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLevelFilter(initialLevel);
  }, [initialLevel]);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<{ nodes: RoadmapNode[] }>('/roadmap'),
      apiFetch<{ items: TrackItem[] }>('/tracks'),
    ])
      .then(([rm, tr]) => {
        if (!active) return;
        setNodes(rm.nodes);
        setTracks(tr.items);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const trackNameMap = useMemo(() => new Map(tracks.map((t) => [t.id, t.name])), [tracks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nodes.filter((n) => {
      if (levelFilter !== null && n.track_id !== levelFilter) return false;
      if (q) {
        const hay = `${n.code} ${n.title} ${n.topics.map((tp) => `${tp.name_vi} ${formatTopic(tp.slug, tp.name_vi, locale)}`).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [nodes, levelFilter, query, locale]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
            {locale === 'vi' ? 'Danh sách 74 bài học' : '74-Lesson Directory'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {locale === 'vi'
              ? 'Mỗi bài gồm lý thuyết ngắn gọn, code mẫu C++17, lỗi hay gặp, bài tập và câu hỏi kiểm tra.'
              : 'Each lesson includes objectives, theory, C++17 reference code, pitfalls, tiered problems, and a quiz.'}
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={locale === 'vi' ? 'Tìm kiếm bài học' : 'Search lessons'}
            placeholder={locale === 'vi' ? 'Tìm mã bài, tên bài hoặc chủ đề...' : 'Search lesson code, title, topic...'}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Level filter tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setLevelFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
            levelFilter === null
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {locale === 'vi' ? 'Tất cả' : 'All levels'}
        </button>
        {tracks.map((tr) => (
          <button
            key={tr.id}
            type="button"
            onClick={() => setLevelFilter(tr.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
              levelFilter === tr.id
                ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {locale === 'vi'
              ? `Cấp ${tr.id} · ${formatTrack(tr.id, tr.name, locale)}`
              : `L${tr.id} · ${formatTrack(tr.id, tr.name, locale)}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          {locale === 'vi' ? 'Không có bài học nào phù hợp.' : 'No lessons match your filter.'}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse tabular-nums">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Mã' : 'Code'}</th>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Tên bài' : 'Lesson'}</th>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Chặng' : 'Track'}</th>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Độ phức tạp' : 'Complexity'}</th>
                  <th className="px-4 py-3 font-medium text-right">{locale === 'vi' ? 'Bài tập' : 'Problems'}</th>
                  <th className="px-4 py-3 font-medium text-right">{locale === 'vi' ? 'Tiến độ' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filtered.map((n) => (
                  <tr
                    key={n.code}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                      {n.code}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/learn/${n.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/learn/${n.slug}`);
                        }}
                        className="font-semibold text-slate-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400"
                      >
                        {n.title}
                      </a>
                      {n.topics.length > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {n.topics.map((tp) => formatTopic(tp.slug, tp.name_vi, locale)).join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {locale === 'vi' ? `Cấp ${n.track_id}` : `Level ${n.track_id}`} ·{' '}
                      {formatTrack(n.track_id, trackNameMap.get(n.track_id) || '', locale)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {n.complexity}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {n.approved_problems}{' '}
                      {n.native_problems > 0
                        ? `(${n.native_problems} ${locale === 'vi' ? 'chấm trên web' : 'native'})`
                        : ''}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex justify-end">
                        <LessonStatusLabel status={n.my_status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
