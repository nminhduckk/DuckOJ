import React, { useEffect, useState } from 'react';
import { ArrowRight, BookCheck, CheckCircle2, KeyRound, Lock, Sparkles, Trash2, UserCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useApp } from '../context/AppContext';
import { formatLanguage, formatRole, formatTier, formatTopic, formatTrack, formatVnDateTime } from '../lib/i18n';
import { VerdictBadge } from '../components/VerdictBadge';
import type { Verdict } from '../types/duckoj';

interface MeStats {
  solved_count: number;
  mastered_count: number;
  attempted_count: number;
  lessons_done: number;
  total_lessons: number;
  by_level: { level: number; name: string; total: number; solved: number }[];
  by_topic: { slug: string; name_vi: string; total: number; solved: number }[];
  calendar_30d: { day: string; count: number }[];
  recent_submissions: {
    id: number;
    language: 'cpp17' | 'python3';
    status: string;
    verdict: Verdict | null;
    max_time_ms: number | null;
    tests_passed: number | null;
    tests_total: number | null;
    submitted_at: string;
    problem_slug: string;
    problem_title: string;
  }[];
  recommended_problems: {
    slug: string;
    title: string;
    kind: 'native' | 'external';
    level: number;
    difficulty: string;
    lesson_code: string;
    lesson_slug: string;
    lesson_title: string;
  }[];
}

export function DashboardPage() {
  const { user, authLoading, refreshUser, logout, locale, t, navigate } = useApp();
  const [stats, setStats] = useState<MeStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile edit
  const [nameInput, setNameInput] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    setNameInput(user.name);
    setLoading(true);
    apiFetch<MeStats>('/me/stats')
      .then((res) => setStats(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-5">
        <div className="inline-flex p-3 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
          {locale === 'vi' ? 'Đăng nhập để theo dõi tiến độ cá nhân' : 'Sign in to track your progress'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {locale === 'vi'
            ? 'Lưu trạng thái 74 bài học, lịch sử chấm bài tự động, gợi ý bài tập tiếp theo và chuỗi luyện tập 30 ngày.'
            : 'Track 74 lessons, automated judge history, next-step problem recommendations, and your 30-day practice streak.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-400"
          >
            {locale === 'vi' ? 'Đăng nhập' : 'Sign in'}
          </a>
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
            className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {locale === 'vi' ? 'Tạo tài khoản' : 'Create account'}
          </a>
        </div>
      </div>
    );
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameMsg('');
    try {
      await apiFetch('/me', { method: 'PATCH', body: JSON.stringify({ name: nameInput }) });
      await refreshUser();
      setNameMsg(locale === 'vi' ? 'Đã cập nhật tên hiển thị.' : 'Display name updated.');
    } catch (err: any) {
      setNameMsg(err?.message || (locale === 'vi' ? 'Không thể cập nhật tên hiển thị.' : 'Could not update display name.'));
    }
  };

  const handleChangePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    setPwErr('');
    try {
      await apiFetch('/me/password', {
        method: 'POST',
        body: JSON.stringify({ current_password: curPw, new_password: newPw }),
      });
      setCurPw('');
      setNewPw('');
      setPwMsg(locale === 'vi' ? 'Đã đổi mật khẩu thành công.' : 'Password changed successfully.');
    } catch (err: any) {
      setPwErr(err?.message || (locale === 'vi' ? 'Không thể đổi mật khẩu.' : 'Could not change password.'));
    }
  };

  const handleDeleteAccount = async () => {
    await apiFetch('/me', { method: 'DELETE' });
    setDeleteConfirmOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <p className="text-xs font-mono text-amber-700 dark:text-amber-400">
            @{user.handle} · {formatRole(user.role, locale)}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display mt-1">
            {user.name}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{user.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/problems')}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 whitespace-nowrap"
          >
            {locale === 'vi' ? 'Kho bài tập' : 'Problems'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/roadmap')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-slate-800 dark:hover:bg-amber-400 whitespace-nowrap"
          >
            <span>{locale === 'vi' ? 'Lộ trình học' : 'Roadmap'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{locale === 'vi' ? 'Bài đã giải' : 'Solved Problems'}</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums font-display">
            {stats?.solved_count ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>{locale === 'vi' ? 'Thành thạo' : 'Mastered'}</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums font-display">
            {stats?.mastered_count ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <BookCheck className="w-4 h-4" />
            <span>{locale === 'vi' ? 'Bài học hoàn thành' : 'Lessons Completed'}</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums font-display">
            {stats?.lessons_done ?? 0}
            <span className="text-base font-normal text-slate-400"> / {stats?.total_lessons ?? 74}</span>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <UserCheck className="w-4 h-4" />
            <span>{locale === 'vi' ? 'Bài đang làm' : 'In Progress'}</span>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tabular-nums font-display">
            {stats?.attempted_count ?? 0}
          </p>
        </div>
      </div>

      {/* Main Grid: Level + Topic + Heatmap + Recommendations */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* 30-day activity heatmap */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {locale === 'vi' ? 'Tần suất luyện tập 30 ngày qua' : '30-Day Activity'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {locale === 'vi' ? 'Số lần nộp / ngày' : 'Attempts / day'}
              </span>
            </div>
            {loading || !stats ? (
              <div className="h-12 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : (
              <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5">
                {stats.calendar_30d.map((d) => {
                  const tone =
                    d.count === 0
                      ? 'bg-slate-100 dark:bg-slate-800'
                      : d.count <= 2
                        ? 'bg-emerald-200 dark:bg-emerald-900/80'
                        : d.count <= 5
                          ? 'bg-emerald-400 dark:bg-emerald-700'
                          : 'bg-emerald-600 dark:bg-emerald-500';
                  return (
                    <div
                      key={d.day}
                      title={`${d.day}: ${d.count} ${locale === 'vi' ? 'lần nộp' : 'attempts'}`}
                      className={`h-7 rounded ${tone} border border-slate-200/60 dark:border-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-700 dark:text-slate-200 tabular-nums`}
                    >
                      {d.count > 0 ? d.count : ''}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Progress by Level */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {locale === 'vi' ? 'Tiến độ theo 7 cấp độ' : 'Progress by Level'}
            </h2>
            <div className="space-y-3">
              {(stats?.by_level || []).map((lv) => {
                const pct = lv.total > 0 ? Math.round((lv.solved / lv.total) * 100) : 0;
                return (
                  <div key={lv.level} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {locale === 'vi' ? `Cấp ${lv.level}` : `Level ${lv.level}`} · {formatTrack(lv.level, lv.name, locale)}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                        {lv.solved}/{lv.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 dark:bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Progress by Topic */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {locale === 'vi' ? 'Phân bổ theo chủ đề' : 'Topic Breakdown'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {(stats?.by_topic || []).map((tp) => {
                const pct = tp.total > 0 ? Math.round((tp.solved / tp.total) * 100) : 0;
                return (
                  <button
                    key={tp.slug}
                    type="button"
                    onClick={() => navigate(`/problems?topic=${encodeURIComponent(tp.slug)}`)}
                    className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {formatTopic(tp.slug, tp.name_vi, locale)}
                      </span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {tp.solved}/{tp.total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right column: Recommended + Recent Submissions */}
        <div className="lg:col-span-5 space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              {locale === 'vi' ? 'Gợi ý bài tập tiếp theo' : 'Recommended Next'}
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(stats?.recommended_problems || []).map((rec) => (
                <div key={rec.slug} className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={`/problems/${rec.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/problems/${rec.slug}`);
                      }}
                      className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-amber-700 dark:hover:text-amber-400 hover:underline block truncate"
                    >
                      {rec.title}
                    </a>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {rec.lesson_code} · {formatTier(rec.difficulty, locale)} · {rec.kind === 'native' ? t.nativeBadge : t.externalBadge}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/problems/${rec.slug}`)}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                  >
                    {locale === 'vi' ? 'Làm' : 'Solve'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {locale === 'vi' ? 'Bài nộp gần đây' : 'Recent Submissions'}
              </h2>
              <a
                href="/submissions"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/submissions');
                }}
                className="text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline"
              >
                {locale === 'vi' ? 'Xem tất cả' : 'View all'}
              </a>
            </div>
            {(stats?.recent_submissions || []).length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4">
                {locale === 'vi' ? 'Bạn chưa có bài nộp nào trên máy chấm.' : 'No judge submissions yet.'}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {stats!.recent_submissions.map((sub) => (
                  <div key={sub.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <a
                        href={`/problems/${sub.problem_slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/problems/${sub.problem_slug}`);
                        }}
                        className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:underline block truncate"
                      >
                        {sub.problem_title}
                      </a>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                        {formatVnDateTime(sub.submitted_at)} · {formatLanguage(sub.language)}
                      </p>
                    </div>
                    <VerdictBadge verdict={sub.verdict} status={sub.status} compact />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Account Settings */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display mb-5">
          {locale === 'vi' ? 'Cài đặt tài khoản' : 'Account Settings'}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <form onSubmit={handleSaveName} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {locale === 'vi' ? 'Tên hiển thị' : 'Display Name'}
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
            {nameMsg && <p className="text-xs text-emerald-700 dark:text-emerald-400">{nameMsg}</p>}
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold hover:opacity-90"
            >
              {locale === 'vi' ? 'Lưu thay đổi' : 'Save Name'}
            </button>
          </form>

          <form onSubmit={handleChangePw} className="space-y-3">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <KeyRound className="w-3.5 h-3.5" />
              <span>{locale === 'vi' ? 'Đổi mật khẩu' : 'Change Password'}</span>
            </label>
            <input
              type="password"
              required
              placeholder={locale === 'vi' ? 'Mật khẩu hiện tại' : 'Current password'}
              value={curPw}
              onChange={(e) => setCurPw(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder={locale === 'vi' ? 'Mật khẩu mới (tối thiểu 8 ký tự)' : 'New password (min 8 chars)'}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
            {pwMsg && <p className="text-xs text-emerald-700 dark:text-emerald-400">{pwMsg}</p>}
            {pwErr && <p className="text-xs text-rose-600 dark:text-rose-400">{pwErr}</p>}
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {locale === 'vi' ? 'Cập nhật mật khẩu' : 'Update Password'}
            </button>
          </form>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              {locale === 'vi' ? 'Xóa tài khoản' : 'Danger Zone'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {locale === 'vi'
                ? 'Hành động này sẽ xóa vĩnh viễn toàn bộ tiến độ, bài nộp và phiên đăng nhập của bạn.'
                : 'Permanently delete your account, progress, and submission records.'}
            </p>
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{locale === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}</span>
            </button>
          </div>
        </div>
      </section>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="max-w-md w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {locale === 'vi' ? 'Xác nhận xóa tài khoản?' : 'Confirm Account Deletion'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {locale === 'vi'
                ? 'Toàn bộ lịch sử học tập và bài nộp sẽ bị xóa vĩnh viễn và không thể khôi phục.'
                : 'All learning progress and submission history will be permanently removed.'}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
              >
                {locale === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                {locale === 'vi' ? 'Xóa vĩnh viễn' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
