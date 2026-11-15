import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const { login, locale, navigate } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitWith = async (targetEmail: string, targetPw: string) => {
    setError('');
    setSubmitting(true);
    try {
      const user = await login(targetEmail, targetPw);
      if (user.role === 'admin' || user.role === 'reviewer') {
        navigate('/admin');
      } else {
        navigate('/me');
      }
    } catch (err: any) {
      setError(err?.message || (locale === 'vi' ? 'Đăng nhập thất bại.' : 'Sign in failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitWith(email, password);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {locale === 'vi' ? 'Đăng nhập DuckOJ' : 'Sign in to DuckOJ'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {locale === 'vi'
              ? 'Lưu tiến độ học, nộp code chấm bài và tham gia kỳ thi.'
              : 'Track your 74-lesson progress, submit to the sandbox judge, and join contests.'}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {locale === 'vi' ? 'Email hoặc tên đăng nhập' : 'Email or username'}
            </label>
            <input
              id="login-email"
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@duckoj.vn"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {locale === 'vi' ? 'Mật khẩu' : 'Password'}
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:opacity-95 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{submitting ? (locale === 'vi' ? 'Đang đăng nhập...' : 'Signing in...') : locale === 'vi' ? 'Đăng nhập' : 'Sign in'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {locale === 'vi' ? 'Tài khoản dùng thử nhanh:' : 'Quick demo accounts:'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: locale === 'vi' ? 'Học viên' : 'Student', email: 'student@duckoj.vn', pw: 'student123' },
              { label: locale === 'vi' ? 'Người duyệt bài' : 'Reviewer', email: 'reviewer@duckoj.vn', pw: 'reviewer123' },
              { label: locale === 'vi' ? 'Quản trị viên' : 'Admin', email: 'admin@duckoj.vn', pw: 'admin123' },
            ].map((acc) => (
              <button
                key={acc.label}
                type="button"
                disabled={submitting}
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.pw);
                  void submitWith(acc.email, acc.pw);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          {locale === 'vi' ? 'Chưa có tài khoản?' : 'New to DuckOJ?'}{' '}
          <a
            href="/register"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
            className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            {locale === 'vi' ? 'Đăng ký ngay' : 'Register'}
          </a>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, locale, navigate } = useApp();
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ email, handle, name, password });
      navigate('/me');
    } catch (err: any) {
      setError(err?.message || (locale === 'vi' ? 'Đăng ký thất bại.' : 'Registration failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {locale === 'vi' ? 'Tạo tài khoản DuckOJ' : 'Create DuckOJ Account'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {locale === 'vi'
              ? 'Miễn phí toàn bộ 74 bài học và chấm bài tự động.'
              : 'Free access to all 74 lessons and automated C++17 / Python 3 judging.'}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hocvien@example.com"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-handle" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {locale === 'vi' ? 'Tên đăng nhập (3–20 ký tự: a-z, 0-9, _)' : 'Username / Handle (3–20 chars: a-z, 0-9, _)'}
            </label>
            <input
              id="reg-handle"
              type="text"
              required
              pattern="^[a-z0-9_]{3,20}$"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase())}
              placeholder="coder_vn"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {locale === 'vi' ? 'Tên hiển thị' : 'Display Name'}
            </label>
            <input
              id="reg-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn An"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {locale === 'vi' ? 'Mật khẩu (tối thiểu 8 ký tự)' : 'Password (min 8 characters)'}
            </label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold hover:opacity-95 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{submitting ? (locale === 'vi' ? 'Đang tạo tài khoản...' : 'Creating...') : locale === 'vi' ? 'Đăng ký' : 'Register'}</span>
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          {locale === 'vi' ? 'Đã có tài khoản?' : 'Already have an account?'}{' '}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
            className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            {locale === 'vi' ? 'Đăng nhập' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  );
}
