import React, { useEffect, useMemo, useState } from 'react';
import { Cpu, ExternalLink, RotateCcw, Search } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { formatTier, formatTopic } from '../lib/i18n';
import { useApp } from '../context/AppContext';
import { ProblemStatusLabel } from '../components/VerdictBadge';
import type { ProblemSummary, TopicItem } from '../types/duckoj';

interface ProblemsResponse {
  items: ProblemSummary[];
  page: number;
  page_size: number;
  total: number;
  facets: {
    levels: Record<number, number>;
    sources: Record<string, number>;
    tiers: Record<string, number>;
    kinds: { native: number; external: number };
  };
}

export function ProblemsPage() {
  const { locale, t, search, navigate } = useApp();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const level = params.get('level') ?? '';
  const kind = params.get('kind') ?? '';
  const source = params.get('source') ?? '';
  const tier = params.get('tier') ?? '';
  const status = params.get('status') ?? '';
  const topic = params.get('topic') ?? '';
  const lesson = params.get('lesson') ?? '';
  const sort = params.get('sort') ?? 'level';
  const qParam = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [qInput, setQInput] = useState(qParam);
  const [data, setData] = useState<ProblemsResponse | null>(null);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setQInput(qParam);
  }, [qParam]);

  useEffect(() => {
    apiFetch<{ items: TopicItem[] }>('/topics')
      .then((res) => setTopics(res.items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const qs = new URLSearchParams();
    if (level !== '') qs.set('level', level);
    if (kind) qs.set('kind', kind);
    if (source) qs.set('source', source);
    if (tier) qs.set('tier', tier);
    if (status) qs.set('status', status);
    if (topic) qs.set('topic', topic);
    if (lesson) qs.set('lesson', lesson);
    if (sort) qs.set('sort', sort);
    if (qParam) qs.set('q', qParam);
    qs.set('page', String(page));
    qs.set('page_size', '20');

    apiFetch<ProblemsResponse>(`/problems?${qs.toString()}`)
      .then((res) => {
        if (active) setData(res);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [level, kind, source, tier, status, topic, lesson, sort, qParam, page]);

  const updateFilter = (updates: Record<string, string>) => {
    const next = new URLSearchParams(search);
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!('page' in updates)) next.delete('page');
    const qStr = next.toString();
    navigate(qStr ? `/problems?${qStr}` : '/problems');
  };

  const resetAll = () => {
    setQInput('');
    navigate('/problems');
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display">
            {locale === 'vi' ? 'Kho bài tập DuckOJ' : 'DuckOJ Problem Archive'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 tabular-nums">
            {data
              ? locale === 'vi'
                ? `Hiển thị ${data.total} bài tập (${data.facets.kinds.native} bài chấm trực tiếp · ${data.facets.kinds.external} bài nguồn ngoài)`
                : `Showing ${data.total} problems (${data.facets.kinds.native} native · ${data.facets.kinds.external} external)`
              : locale === 'vi'
                ? 'Đang tải danh sách bài tập...'
                : 'Loading problems...'}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateFilter({ q: qInput.trim() });
          }}
          className="flex items-center gap-2 w-full md:w-80"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              aria-label={locale === 'vi' ? 'Tìm kiếm bài tập' : 'Search problems'}
              placeholder={locale === 'vi' ? 'Tìm tên hoặc mã bài...' : 'Search title or ID...'}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium whitespace-nowrap shrink-0"
          >
            {locale === 'vi' ? 'Tìm' : 'Search'}
          </button>
        </form>
      </div>

      {/* Multi-facet filters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {[
              { k: '', label: locale === 'vi' ? 'Tất cả' : 'All' },
              { k: 'native', label: t.nativeBadge },
              { k: 'external', label: t.externalBadge },
            ].map((opt) => (
              <button
                key={opt.k}
                type="button"
                onClick={() => updateFilter({ kind: opt.k })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  kind === opt.k
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{locale === 'vi' ? 'Xóa bộ lọc' : 'Reset filters'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <select
            aria-label={locale === 'vi' ? 'Lọc theo cấp' : 'Filter by level'}
            value={level}
            onChange={(e) => updateFilter({ level: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{locale === 'vi' ? 'Mọi cấp độ' : 'All levels'}</option>
            {[0, 1, 2, 3, 4, 5, 6].map((lv) => (
              <option key={lv} value={String(lv)}>
                {locale === 'vi' ? `Cấp ${lv}` : `Level ${lv}`}
              </option>
            ))}
          </select>

          <select
            aria-label={locale === 'vi' ? 'Lọc theo nguồn' : 'Filter by source'}
            value={source}
            onChange={(e) => updateFilter({ source: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{locale === 'vi' ? 'Mọi nguồn' : 'All sources'}</option>
            {['Native', 'CSES', 'Codeforces', 'AtCoder', 'LibraryChecker', 'Other'].map((s) => (
              <option key={s} value={s}>
                {s === 'Native'
                  ? locale === 'vi'
                    ? 'DuckOJ (Chấm trực tiếp)'
                    : 'DuckOJ Judge'
                  : s === 'Other'
                    ? locale === 'vi'
                      ? 'Nguồn khác'
                      : 'Other'
                    : s}
              </option>
            ))}
          </select>

          <select
            aria-label={locale === 'vi' ? 'Lọc theo độ khó' : 'Filter by tier'}
            value={tier}
            onChange={(e) => updateFilter({ tier: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{locale === 'vi' ? 'Mọi độ khó' : 'All tiers'}</option>
            {(['Khởi động', 'Luyện tập', 'Thử thách'] as const).map((tierVal) => (
              <option key={tierVal} value={tierVal}>
                {formatTier(tierVal, locale)}
              </option>
            ))}
          </select>

          <select
            aria-label={locale === 'vi' ? 'Lọc theo chuyên đề' : 'Filter by topic'}
            value={topic}
            onChange={(e) => updateFilter({ topic: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{locale === 'vi' ? 'Mọi chuyên đề' : 'All topics'}</option>
            {topics.map((tp) => (
              <option key={tp.slug} value={tp.slug}>
                {formatTopic(tp.slug, tp.name_vi, locale)} ({tp.problem_count ?? 0})
              </option>
            ))}
          </select>

          <select
            aria-label={locale === 'vi' ? 'Lọc theo trạng thái' : 'Filter by status'}
            value={status}
            onChange={(e) => updateFilter({ status: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="">{locale === 'vi' ? 'Mọi trạng thái' : 'All statuses'}</option>
            <option value="not_started">{t.probNotStarted}</option>
            <option value="attempted">{t.probAttempted}</option>
            <option value="solved">{t.probSolved}</option>
            <option value="mastered">{t.probMastered}</option>
          </select>

          <select
            aria-label={locale === 'vi' ? 'Sắp xếp' : 'Sort'}
            value={sort}
            onChange={(e) => updateFilter({ sort: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          >
            <option value="level">{locale === 'vi' ? 'Sắp xếp: Cấp độ' : 'Sort: Level'}</option>
            <option value="rating_asc">{locale === 'vi' ? 'Rating tăng dần' : 'Rating ascending'}</option>
            <option value="rating_desc">{locale === 'vi' ? 'Rating giảm dần' : 'Rating descending'}</option>
            <option value="title">{locale === 'vi' ? 'Tên A-Z' : 'Title A-Z'}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-10 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400 space-y-3">
            <p>{locale === 'vi' ? 'Không có bài tập phù hợp bộ lọc.' : 'No problems match these filters.'}</p>
            <button
              type="button"
              onClick={resetAll}
              className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
            >
              {locale === 'vi' ? 'Hiển thị tất cả' : 'Show all problems'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse tabular-nums">
              <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Bài tập' : 'Problem'}</th>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Nguồn' : 'Source'}</th>
                  <th className="px-4 py-3 font-medium">{locale === 'vi' ? 'Cấp / Độ khó' : 'Level / Tier'}</th>
                  <th className="px-4 py-3 font-medium text-right">{locale === 'vi' ? 'Trạng thái' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.items.map((p) => (
                  <tr key={p.slug} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <a
                        href={`/problems/${p.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/problems/${p.slug}`);
                        }}
                        className="font-semibold text-slate-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400"
                      >
                        {p.title}
                      </a>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {p.topics.slice(0, 4).map((tp) => formatTopic(tp.slug, tp.name_vi, locale)).join(' · ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {p.kind === 'native' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>{t.nativeBadge}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <span>
                            {p.source} {p.source_id}
                          </span>
                          {p.source_url && <ExternalLink className="w-3 h-3 text-slate-400" />}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {locale === 'vi' ? `Cấp ${p.level}` : `Level ${p.level}`} · {formatTier(p.difficulty, locale)}
                      {p.cf_rating ? ` · ${p.cf_rating}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex justify-end">
                        <ProblemStatusLabel status={p.my_status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 tabular-nums">
          <span>
            {locale === 'vi' ? `Trang ${page} / ${totalPages}` : `Page ${page} / ${totalPages}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => updateFilter({ page: String(page - 1) })}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
            >
              {locale === 'vi' ? 'Trước' : 'Prev'}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => updateFilter({ page: String(page + 1) })}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
            >
              {locale === 'vi' ? 'Sau' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
