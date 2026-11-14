import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Compass } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import { LessonStatusLabel } from '../components/VerdictBadge';
import type { LessonStatus, RoadmapEdge, RoadmapNode, TrackItem } from '../types/duckoj';

interface EdgeLine {
  id: string;
  source: string;
  target: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function RoadmapPage() {
  const { locale, navigate } = useApp();
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [edges, setEdges] = useState<RoadmapEdge[]>([]);
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | LessonStatus>('all');
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [lines, setLines] = useState<EdgeLine[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<{ nodes: RoadmapNode[]; edges: RoadmapEdge[] }>('/roadmap'),
      apiFetch<{ items: TrackItem[] }>('/tracks'),
    ])
      .then(([rm, tr]) => {
        if (!active) return;
        setNodes(rm.nodes);
        setEdges(rm.edges);
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

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.code, n])), [nodes]);
  const prereqMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const e of edges) {
      const arr = m.get(e.target) || [];
      arr.push(e.source);
      m.set(e.target, arr);
    }
    return m;
  }, [edges]);
  const dependentMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const e of edges) {
      const arr = m.get(e.source) || [];
      arr.push(e.target);
      m.set(e.source, arr);
    }
    return m;
  }, [edges]);

  // Recommended next lesson: lowest track/sort where my_status !== 'done' and all prereqs done
  const recommendedLesson = useMemo(() => {
    const candidate = nodes.find((n) => {
      if (n.my_status === 'done') return false;
      const prs = prereqMap.get(n.code) || [];
      return prs.every((code) => nodeMap.get(code)?.my_status === 'done');
    });
    return candidate || nodes.find((n) => n.my_status !== 'done') || nodes[0] || null;
  }, [nodes, prereqMap, nodeMap]);

  const highlightedSet = useMemo(() => {
    if (!activeCode) return new Set<string>();
    const s = new Set<string>([activeCode]);
    for (const p of prereqMap.get(activeCode) || []) s.add(p);
    for (const d of dependentMap.get(activeCode) || []) s.add(d);
    return s;
  }, [activeCode, prereqMap, dependentMap]);

  const computeLines = () => {
    const root = containerRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const nextLines: EdgeLine[] = [];
    for (const e of edges) {
      const srcEl = nodeRefs.current.get(e.source);
      const tgtEl = nodeRefs.current.get(e.target);
      if (!srcEl || !tgtEl) continue;
      const sRect = srcEl.getBoundingClientRect();
      const tRect = tgtEl.getBoundingClientRect();
      nextLines.push({
        id: `${e.source}->${e.target}`,
        source: e.source,
        target: e.target,
        x1: sRect.left - rootRect.left + sRect.width / 2,
        y1: sRect.bottom - rootRect.top,
        x2: tRect.left - rootRect.left + tRect.width / 2,
        y2: tRect.top - rootRect.top,
      });
    }
    setLines(nextLines);
  };

  useLayoutEffect(() => {
    computeLines();
    const ro = new ResizeObserver(() => computeLines());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', computeLines);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeLines);
    };
  }, [nodes, edges, statusFilter]);

  const groupedTracks = useMemo(() => {
    return tracks.map((tr) => ({
      track: tr,
      items: nodes.filter((n) => n.track_id === tr.id && (statusFilter === 'all' || n.my_status === statusFilter)),
    }));
  }, [tracks, nodes, statusFilter]);

  const doneCount = nodes.filter((n) => n.my_status === 'done').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            {locale === 'vi' ? 'Đồ thị kỹ năng DAG 74 bài học' : '74-Lesson Directed Acyclic Skill Tree'}
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-display mt-1">
            {locale === 'vi' ? 'Lộ trình học lập trình thi đấu' : 'Competitive Programming Roadmap'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 tabular-nums">
            {locale === 'vi'
              ? `Đã hoàn thành ${doneCount} / ${nodes.length || 74} bài học. Di chuột hoặc chạm vào một bài để xem bài tiên quyết và bài mở khóa.`
              : `Completed ${doneCount} / ${nodes.length || 74} lessons. Hover or focus any node to highlight prerequisites and unlocked lessons.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {recommendedLesson && (
            <button
              type="button"
              onClick={() => navigate(`/learn/${recommendedLesson.slug}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
            >
              <Compass className="w-4 h-4" />
              <span>
                {locale === 'vi' ? `Học tiếp: ${recommendedLesson.code}` : `Next: ${recommendedLesson.code}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {(
            [
              { key: 'all', label: locale === 'vi' ? 'Tất cả (74)' : 'All (74)' },
              { key: 'done', label: locale === 'vi' ? 'Hoàn thành' : 'Done' },
              { key: 'reading', label: locale === 'vi' ? 'Đang học' : 'Reading' },
              { key: 'not_started', label: locale === 'vi' ? 'Chưa học' : 'Not started' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === tab.key
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeCode && nodeMap.get(activeCode) && (
          <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {activeCode} · {nodeMap.get(activeCode)!.title}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {locale === 'vi' ? 'Tiên quyết:' : 'Prerequisites:'}{' '}
              {(prereqMap.get(activeCode) || []).join(', ') || (locale === 'vi' ? 'Không có' : 'None')}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div ref={containerRef} className="relative space-y-10">
          {/* SVG prerequisite Bezier edges behind nodes */}
          {statusFilter === 'all' && lines.length > 0 && (
            <svg
              aria-hidden="true"
              className="hidden lg:block pointer-events-none absolute inset-0 w-full h-full z-0"
            >
              {lines.map((ln) => {
                const isHighlighted =
                  activeCode !== null && (ln.source === activeCode || ln.target === activeCode);
                const dimmed = activeCode !== null && !isHighlighted;
                const midY = (ln.y1 + ln.y2) / 2;
                const d = `M ${ln.x1} ${ln.y1} C ${ln.x1} ${midY}, ${ln.x2} ${midY}, ${ln.x2} ${ln.y2}`;
                return (
                  <path
                    key={ln.id}
                    d={d}
                    fill="none"
                    stroke={isHighlighted ? '#d97706' : 'currentColor'}
                    className={
                      isHighlighted
                        ? 'opacity-90'
                        : dimmed
                          ? 'text-slate-300 dark:text-slate-800 opacity-10'
                          : 'text-slate-300 dark:text-slate-700 opacity-35'
                    }
                    strokeWidth={isHighlighted ? 2.2 : 1.1}
                  />
                );
              })}
            </svg>
          )}

          {groupedTracks.map(({ track, items }) => {
            if (items.length === 0) return null;
            return (
              <section key={track.id} className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                      {locale === 'vi' ? `Cấp ${track.id}: ${track.name}` : `Level ${track.id}: ${track.name}`}
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {track.cf_rating_range}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {items.filter((i) => i.my_status === 'done').length} / {items.length}{' '}
                    {locale === 'vi' ? 'hoàn thành' : 'completed'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map((node) => {
                    const isFocused = activeCode === node.code;
                    const isRelated = highlightedSet.has(node.code);
                    const dimmed = activeCode !== null && !isRelated;
                    const prereqs = prereqMap.get(node.code) || [];

                    return (
                      <button
                        key={node.code}
                        ref={(el) => {
                          if (el) nodeRefs.current.set(node.code, el);
                          else nodeRefs.current.delete(node.code);
                        }}
                        type="button"
                        onMouseEnter={() => setActiveCode(node.code)}
                        onMouseLeave={() => setActiveCode(null)}
                        onFocus={() => setActiveCode(node.code)}
                        onBlur={() => setActiveCode(null)}
                        onClick={() => navigate(`/learn/${node.slug}`)}
                        data-lesson-code={node.code}
                        className={`text-left rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-2.5 bg-white dark:bg-slate-900 ${
                          isFocused
                            ? 'border-amber-500 ring-2 ring-amber-500/20'
                            : isRelated
                              ? 'border-amber-400 dark:border-amber-600'
                              : node.my_status === 'done'
                                ? 'border-emerald-300 dark:border-emerald-800'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                        } ${dimmed ? 'opacity-45' : 'opacity-100'}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 text-xs mb-1 tabular-nums">
                            <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">
                              {node.code}
                            </span>
                            <LessonStatusLabel status={node.my_status} />
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                            {node.title}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 tabular-nums">
                          <span>
                            {node.approved_problems} {locale === 'vi' ? 'bài' : 'probs'}
                            {node.native_problems > 0
                              ? ` (${node.native_problems} ${locale === 'vi' ? 'chấm trực tiếp' : 'native'})`
                              : ''}
                          </span>
                          {prereqs.length > 0 && (
                            <span className="truncate max-w-[110px]" title={prereqs.join(', ')}>
                              ← {prereqs.join(', ')}
                            </span>
                          )}
                          {prereqs.length === 0 && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{locale === 'vi' ? 'Gốc' : 'Start'}</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
