import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Code2, Cpu, GitBranch, Trophy } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { formatTrack, formatTrackDescription, formatTrackDuration, formatTrackRange } from '../lib/i18n';
import { useApp } from '../context/AppContext';
import type { TrackItem } from '../types/duckoj';

export function HomePage() {
  const { locale, t, navigate } = useApp();
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<{ items: TrackItem[] }>('/tracks')
      .then((res) => {
        if (active) setTracks(res.items);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const totalLessons = tracks.reduce((s, r) => s + Number(r.lessons_count || 0), 0) || 74;
  const totalProblems = tracks.reduce((s, r) => s + Number(r.problems_count || 0), 0);
  const totalNative = tracks.reduce((s, r) => s + Number(r.native_count || 0), 0) || 43;

  return (
    <div>
      {/* Hero section */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 tracking-wide">
                {locale === 'vi'
                  ? 'Học lập trình từ con số 0 · Chấm bài tự động'
                  : 'Structured Algorithms Curriculum · Automated C++17 & Python 3 Judge'}
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12] font-display text-balance max-w-2xl">
                {locale === 'vi'
                  ? 'Học lập trình thi đấu dễ hiểu từ cơ bản đến nâng cao'
                  : 'Master Competitive Programming from Level 0 to Grandmaster'}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                {locale === 'vi'
                  ? `${totalLessons} bài học theo trình tự rõ ràng, bài tập chọn lọc và ${totalNative} bài nộp code chấm ngay trên web.`
                  : `DuckOJ pairs ${totalLessons} structured lessons in an acyclic skill tree with curated Codeforces, CSES, and AtCoder problems plus ${totalNative} native automated judge tasks.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="/learn/cpp-syntax-io"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/learn/cpp-syntax-io');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
              >
                <span>{t.startFromZero}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/roadmap"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/roadmap');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                <GitBranch className="w-4 h-4" />
                <span>{locale === 'vi' ? 'Xem lộ trình 74 bài' : 'Explore 74-Lesson Roadmap'}</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-6 flex flex-col justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {locale === 'vi' ? 'Bạn nhận được gì ở DuckOJ?' : 'DuckOJ Learning Architecture'}
              </h2>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {locale === 'vi' ? 'Bài học ngắn gọn, dễ hiểu' : '8-Section Theory & Graded Quiz'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {locale === 'vi'
                        ? 'Lý thuyết kèm ví dụ C++17, lỗi hay gặp và câu hỏi ôn bài.'
                        : 'Objectives, KaTeX theory, runnable C++17 samples, pitfalls, and quiz checks.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Cpu className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {locale === 'vi' ? 'Nộp code & chấm từng test ngay' : 'Sandbox Judge & Real-Time Streaming'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {locale === 'vi'
                        ? 'Hỗ trợ C++17 và Python 3, báo rõ sai ở test nào.'
                        : 'Live test-by-test verdicts with tokens, lines, float tolerance, and custom checkers.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {locale === 'vi' ? 'Kỳ thi tính giờ & gợi ý từng bước' : 'ICPC Contests & 4-Tier Progressive Hints'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {locale === 'vi'
                        ? 'Thi thử có bảng xếp hạng và gợi ý mở dần khi cần.'
                        : 'Live ICPC penalty standings and anti-spoil progressive hint unlocking.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{locale === 'vi' ? 'Làm thử bài đầu tiên:' : 'Try live judge now:'}</span>
              <a
                href="/problems/nat-sum-diff"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/problems/nat-sum-diff');
                }}
                className="font-mono font-semibold text-amber-700 dark:text-amber-400 hover:underline"
              >
                nat-sum-diff →
              </a>
            </div>
          </div>
        </div>

        {/* Full-width 4-column summary metrics strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-800 pt-8">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums font-display">7</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {locale === 'vi' ? 'Chặng học từ Cấp 0 đến Cấp 6' : 'Progressive Curriculum Tracks'}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums font-display">{totalLessons}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {locale === 'vi' ? 'Bài học hướng dẫn' : 'Lessons'}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums font-display">{totalNative}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {locale === 'vi' ? 'Bài chấm ngay trên web' : 'Native Automated Judge Problems'}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums font-display">
                {totalProblems || 310}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {locale === 'vi' ? 'Tổng số bài tập' : 'Published Practice Problems'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Tracks overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
              {locale === 'vi' ? 'Lộ trình 7 chặng' : '7 Curriculum Tracks'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {locale === 'vi'
                ? 'Học từ những dòng code C++ đầu tiên đến các thuật toán nâng cao.'
                : 'Progress systematically from C++17 fundamentals to advanced competitive algorithms.'}
            </p>
          </div>
          <a
            href="/problems?kind=native"
            onClick={(e) => {
              e.preventDefault();
              navigate('/problems?kind=native');
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline whitespace-nowrap shrink-0"
          >
            <Code2 className="w-4 h-4" />
            <span>
              {locale === 'vi'
                ? `Xem ${totalNative} bài chấm trên web`
                : `Browse ${totalNative} Native Judge Problems`}
            </span>
          </a>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="h-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((tr) => (
              <button
                key={tr.id}
                type="button"
                onClick={() => navigate(`/learn?level=${tr.id}`)}
                className="text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-amber-500 dark:hover:border-amber-500 transition-colors flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5 tabular-nums">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      {locale === 'vi' ? `Cấp ${tr.id}` : `Level ${tr.id}`}
                    </span>
                    <span>{formatTrackRange(tr.id, tr.cf_rating_range, locale)}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {formatTrack(tr.id, tr.name, locale)}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2">
                    {formatTrackDescription(tr.id, tr.description, locale)}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 tabular-nums">
                  <span>
                    {tr.lessons_count} {locale === 'vi' ? 'bài học' : 'lessons'} · {tr.problems_count}{' '}
                    {locale === 'vi' ? 'bài tập' : 'problems'}
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {formatTrackDuration(tr.estimated_duration, locale)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
