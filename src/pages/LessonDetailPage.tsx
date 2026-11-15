import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Cpu, ExternalLink, HelpCircle } from 'lucide-react';
import { apiFetch, ApiError } from '../lib/api';
import { formatHintType, formatSourceKind, formatTier, formatTrack, formatTrackRange } from '../lib/i18n';
import { useApp } from '../context/AppContext';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { LessonStatusLabel, ProblemStatusLabel } from '../components/VerdictBadge';
import { ReportModal } from '../components/ReportModal';
import type { LessonDetail } from '../types/duckoj';

interface QuizSubmitResponse {
  score: number;
  total: number;
  best_score: number;
  lesson_status: 'not_started' | 'reading' | 'done';
  results: {
    index: number;
    chosen: number;
    answer_index: number;
    correct: boolean;
    explain: string;
  }[];
}

export function LessonDetailPage({ slug }: { slug: string }) {
  const { user, locale, t, navigate } = useApp();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tierTab, setTierTab] = useState<'all' | 'Khởi động' | 'Luyện tập' | 'Thử thách'>('all');
  const [openHints, setOpenHints] = useState<Set<number>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [markingDone, setMarkingDone] = useState(false);
  const [progressErr, setProgressErr] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const loadLesson = () => {
    setLoading(true);
    setError(null);
    apiFetch<LessonDetail>(`/lessons/${encodeURIComponent(slug)}`)
      .then((res) => {
        setLesson(res);
        setQuizResult(null);
        setQuizAnswers({});
        setOpenHints(new Set());
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : locale === 'vi' ? 'Không thể tải bài học.' : 'Failed to load lesson.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLesson();
  }, [slug]);

  const filteredProblems = useMemo(() => {
    if (!lesson) return [];
    if (tierTab === 'all') return lesson.problems;
    return lesson.problems.filter((p) => (p.tier || p.difficulty) === tierTab);
  }, [lesson, tierTab]);

  const handleMarkStatus = async (status: 'reading' | 'done') => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!lesson) return;
    setMarkingDone(true);
    setProgressErr(null);
    try {
      await apiFetch(`/lessons/${lesson.slug}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setLesson({ ...lesson, my_progress: { ...lesson.my_progress, status } });
    } catch (err) {
      setProgressErr(
        err instanceof ApiError
          ? err.message
          : locale === 'vi'
            ? 'Không thể cập nhật tiến độ bài học.'
            : 'Failed to update lesson progress.'
      );
    } finally {
      setMarkingDone(false);
    }
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setQuizError(null);
    const answers = lesson.quiz.map((_, i) => quizAnswers[i]);
    if (answers.some((a) => a === undefined)) {
      setQuizError(
        locale === 'vi' ? 'Vui lòng chọn đáp án cho tất cả câu hỏi.' : 'Please select an answer for every question.'
      );
      return;
    }
    setQuizSubmitting(true);
    try {
      const res = await apiFetch<QuizSubmitResponse>(`/lessons/${lesson.slug}/quiz/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      setQuizResult(res);
      setLesson({
        ...lesson,
        my_progress: {
          status: res.lesson_status,
          quiz_best_score: res.best_score,
        },
      });
    } catch (err) {
      setQuizError(
        err instanceof ApiError ? err.message : locale === 'vi' ? 'Không thể nộp bài kiểm tra.' : 'Failed to submit quiz.'
      );
    } finally {
      setQuizSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="h-12 w-72 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="h-96 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
        <p className="text-base text-rose-600 dark:text-rose-400">
          {error || (locale === 'vi' ? 'Không tìm thấy bài học.' : 'Lesson not found.')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/learn')}
          className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium"
        >
          {locale === 'vi' ? 'Quay lại danh sách bài học' : 'Back to lessons'}
        </button>
      </div>
    );
  }

  const tocSections = [
    { id: 'sec-objectives', label: locale === 'vi' ? '1. Mục tiêu' : '1. Objectives' },
    { id: 'sec-theory', label: locale === 'vi' ? '2. Lý thuyết' : '2. Theory' },
    { id: 'sec-sample', label: locale === 'vi' ? '3. Code mẫu C++17' : '3. C++17 Sample' },
    { id: 'sec-mistakes', label: locale === 'vi' ? '4. Lỗi hay gặp' : '4. Common Mistakes' },
    { id: 'sec-sources', label: locale === 'vi' ? '5. Đọc thêm' : '5. References' },
    { id: 'sec-problems', label: locale === 'vi' ? '6. Bài tập' : '6. Practice Problems' },
    { id: 'sec-hints', label: locale === 'vi' ? '7. Gợi ý' : '7. Lesson Hints' },
    { id: 'sec-quiz', label: locale === 'vi' ? '8. Kiểm tra nhanh' : '8. Lesson Quiz' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/roadmap')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'vi' ? 'Quay lại Lộ trình' : 'Back to Roadmap'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <LessonStatusLabel status={lesson.my_progress.status} />
          <button
            type="button"
            disabled={markingDone}
            onClick={() => handleMarkStatus(lesson.my_progress.status === 'done' ? 'reading' : 'done')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {lesson.my_progress.status === 'done'
                ? locale === 'vi'
                  ? 'Đã xong'
                  : 'Completed'
                : locale === 'vi'
                  ? 'Đánh dấu đã xong'
                  : 'Mark as Done'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            {t.reportIssue}
          </button>
        </div>
      </div>

      {progressErr && (
        <div className="mb-4 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-2 text-xs text-rose-700 dark:text-rose-300">
          {progressErr}
        </div>
      )}

      {/* Header metadata */}
      <header className="pb-6 mb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2 tabular-nums">
          <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
            {lesson.code}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {locale === 'vi' ? `Cấp ${lesson.track_id}` : `Level ${lesson.track_id}`} —{' '}
            {formatTrack(lesson.track_id, lesson.track_name, locale)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{lesson.complexity}</span>
          <span aria-hidden="true">·</span>
          <span>{formatTrackRange(lesson.track_id, lesson.cf_rating_range, locale)}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white font-display">
          {lesson.title}
        </h1>
        {lesson.prereqs.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>{locale === 'vi' ? 'Cần học trước:' : 'Prerequisites:'}</span>
            {lesson.prereqs.map((pr, idx) => (
              <React.Fragment key={pr.code}>
                {idx > 0 && <span aria-hidden="true">·</span>}
                <a
                  href={`/learn/${pr.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/learn/${pr.slug}`);
                  }}
                  className="font-medium text-amber-700 dark:text-amber-400 hover:underline"
                >
                  {pr.code} {pr.title}
                </a>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Sticky 8-section TOC on desktop */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            {locale === 'vi' ? 'Nội dung bài học' : 'Lesson Sections'}
          </p>
          <nav className="space-y-1">
            {tocSections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="block px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {sec.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main 8 sections */}
        <div className="lg:col-span-9 space-y-10">
          {/* 1. Objectives */}
          <section id="sec-objectives" className="scroll-mt-20 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {tocSections[0].label}
            </h2>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <MarkdownRenderer content={lesson.objectives_md} />
            </div>
          </section>

          {/* 2. Theory */}
          <section id="sec-theory" className="scroll-mt-20 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {tocSections[1].label}
            </h2>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <MarkdownRenderer content={lesson.theory_md} />
            </div>
          </section>

          {/* 3. Code sample */}
          <section id="sec-sample" className="scroll-mt-20 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {tocSections[2].label}
              </h2>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {lesson.complexity}
              </span>
            </div>
            <MarkdownRenderer content={`\`\`\`cpp\n${lesson.code_sample}\n\`\`\``} />
          </section>

          {/* 4. Common mistakes */}
          <section id="sec-mistakes" className="scroll-mt-20 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {tocSections[3].label}
            </h2>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <MarkdownRenderer content={lesson.common_mistakes_md} />
            </div>
          </section>

          {/* 5. Sources */}
          <section id="sec-sources" className="scroll-mt-20 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {tocSections[4].label}
            </h2>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {lesson.sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{src.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatSourceKind(src.kind, locale)}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                </a>
              ))}
            </div>
          </section>

          {/* 6. Practice Problems */}
          <section id="sec-problems" className="scroll-mt-20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {tocSections[5].label} ({lesson.problems.length})
              </h2>
              <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {(['all', 'Khởi động', 'Luyện tập', 'Thử thách'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setTierTab(tier)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      tierTab === tier
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tier === 'all' ? (locale === 'vi' ? 'Tất cả' : 'All') : formatTier(tier, locale)}
                  </button>
                ))}
              </div>
            </div>

            {filteredProblems.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-sm text-slate-500 dark:text-slate-400">
                {locale === 'vi'
                  ? 'Chưa có bài tập ở mức này.'
                  : 'No approved problems in this tier yet.'}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                {filteredProblems.map((p) => (
                  <div
                    key={p.slug}
                    className="px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-0.5 tabular-nums">
                        {p.kind === 'native' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                            <Cpu className="w-3.5 h-3.5" />
                            <span>{t.nativeBadge}</span>
                          </span>
                        ) : (
                          <span>
                            {p.source} {p.source_id}
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{formatTier(p.tier || p.difficulty, locale)}</span>
                        {p.cf_rating && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Rating {p.cf_rating}</span>
                          </>
                        )}
                      </div>
                      <a
                        href={`/problems/${p.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/problems/${p.slug}`);
                        }}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-amber-700 dark:hover:text-amber-400"
                      >
                        {p.title}
                      </a>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <ProblemStatusLabel status={p.my_status} />
                      <a
                        href={`/problems/${p.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/problems/${p.slug}`);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
                      >
                        {p.kind === 'native'
                          ? locale === 'vi'
                            ? 'Làm bài'
                            : 'Open IDE'
                          : locale === 'vi'
                            ? 'Xem đề'
                            : 'Details'}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 7. Lesson Hints */}
          <section id="sec-hints" className="scroll-mt-20 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {tocSections[6].label}
            </h2>
            <div className="space-y-2">
              {lesson.hints.map((h) => {
                const isOpen = openHints.has(h.level);
                return (
                  <div
                    key={h.level}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => {
                        const next = new Set(openHints);
                        if (isOpen) next.delete(h.level);
                        else next.add(h.level);
                        setOpenHints(next);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between text-left text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <span className="inline-flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>
                          {locale === 'vi' ? `Gợi ý ${h.level}` : `Hint Tier ${h.level}`} · {formatHintType(h.type, locale)}
                        </span>
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <MarkdownRenderer content={h.text_md} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 8. Interactive Quiz */}
          <section id="sec-quiz" className="scroll-mt-20 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {tocSections[7].label}
              </h2>
              {lesson.my_progress.quiz_best_score !== null && (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {locale === 'vi'
                    ? `Điểm cao nhất: ${lesson.my_progress.quiz_best_score}/${lesson.quiz.length}`
                    : `Best score: ${lesson.my_progress.quiz_best_score}/${lesson.quiz.length}`}
                </span>
              )}
            </div>

            <form
              onSubmit={handleSubmitQuiz}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6"
            >
              {lesson.quiz.map((qItem, idx) => {
                const resItem = quizResult?.results.find((r) => r.index === idx);
                return (
                  <fieldset key={idx} className="space-y-2.5">
                    <legend className="text-sm font-semibold text-slate-900 dark:text-white">
                      {locale === 'vi' ? `Câu ${idx + 1}: ` : `Q${idx + 1}: `}
                      {qItem.q}
                    </legend>
                    <div className="space-y-2">
                      {qItem.options.map((opt, optIdx) => {
                        const checked = quizAnswers[idx] === optIdx;
                        const isCorrectOpt = resItem && resItem.answer_index === optIdx;
                        const isWrongChosen = resItem && resItem.chosen === optIdx && !resItem.correct;
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                              isCorrectOpt
                                ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-slate-900 dark:text-white'
                                : isWrongChosen
                                  ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-slate-900 dark:text-white'
                                  : checked
                                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 text-slate-900 dark:text-white'
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz-q-${idx}`}
                              checked={checked}
                              onChange={() => setQuizAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                              className="mt-0.5 accent-amber-600"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                    {resItem && (
                      <p
                        className={`text-xs mt-1 ${
                          resItem.correct
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {resItem.correct
                          ? locale === 'vi'
                            ? '✓ Đúng — '
                            : '✓ Correct — '
                          : locale === 'vi'
                            ? '✗ Sai — '
                            : '✗ Incorrect — '}
                        {resItem.explain}
                      </p>
                    )}
                  </fieldset>
                );
              })}

              {quizError && <p className="text-sm text-rose-600 dark:text-rose-400">{quizError}</p>}

              {quizResult && (
                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white tabular-nums">
                  {locale === 'vi'
                    ? `Kết quả: ${quizResult.score}/${quizResult.total} câu đúng.`
                    : `Result: ${quizResult.score}/${quizResult.total} correct.`}
                  {quizResult.score === quizResult.total &&
                    (locale === 'vi'
                      ? ' Bài học đã được đánh dấu xong!'
                      : ' Lesson marked as completed!')}
                </div>
              )}

              <div className="flex items-center justify-between gap-4">
                {!user && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {locale === 'vi'
                      ? 'Đăng nhập để lưu điểm và tiến độ học.'
                      : 'Sign in to save your quiz score and lesson progress.'}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={quizSubmitting}
                  className="ml-auto px-5 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50"
                >
                  {quizSubmitting
                    ? locale === 'vi'
                      ? 'Đang chấm...'
                      : 'Grading...'
                    : locale === 'vi'
                      ? 'Nộp bài kiểm tra'
                      : 'Submit Quiz'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        defaultType="lesson"
        defaultTargetId={lesson.code}
      />
    </div>
  );
}
