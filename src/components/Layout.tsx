import React, { useState } from 'react';
import { ChevronDown, Globe, LogOut, Menu, Moon, ShieldCheck, Sun, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRole } from '../lib/i18n';
import { ReportModal } from './ReportModal';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, locale, setLocale, t, theme, toggleTheme, pathname, navigate } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const navItems = [
    { href: '/roadmap', label: t.navRoadmap },
    { href: '/learn', label: t.navLearn },
    { href: '/problems', label: t.navProblems },
    { href: '/contests', label: t.navContests },
    { href: '/me', label: t.navMe },
  ];

  const handleLink = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    setAccountOpen(false);
    navigate(href);
  };

  const isStaff = user && (user.role === 'admin' || user.role === 'reviewer');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Strict 3-zone header: Brand — 5 single-line nav links — 1 primary account/CTA */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => handleLink(e, '/')}
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 font-display"
          >
            DuckOJ
          </a>

          {/* Zone 2: 5 concise single-line text nav links */}
          <nav aria-label={locale === 'vi' ? 'Điều hướng chính' : 'Primary navigation'} className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLink(e, item.href)}
                  className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
                    active
                      ? 'text-amber-700 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Theme switcher + account/CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              data-testid="header-theme-toggle"
              aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
              title={theme === 'dark' ? t.themeLight : t.themeDark}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {theme === 'dark' ? (locale === 'vi' ? 'Sáng' : 'Light') : locale === 'vi' ? 'Tối' : 'Dark'}
              </span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((o) => !o)}
                  aria-expanded={accountOpen}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
                >
                  <User className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="max-w-[120px] truncate">{user.handle}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg py-1.5 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        @{user.handle} · {formatRole(user.role, locale)}
                      </p>
                    </div>
                    <a
                      href="/me"
                      onClick={(e) => handleLink(e, '/me')}
                      className="block px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {t.navMe}
                    </a>
                    <a
                      href="/submissions"
                      onClick={(e) => handleLink(e, '/submissions')}
                      className="block px-3.5 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {t.navSubmissions}
                    </a>
                    {isStaff && (
                      <a
                        href="/admin"
                        onClick={(e) => handleLink(e, '/admin')}
                        className="flex items-center gap-2 px-3.5 py-2 text-sm text-amber-700 dark:text-amber-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>{t.navAdmin}</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setAccountOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-800 mt-1"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                onClick={(e) => handleLink(e, '/login')}
                className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-medium hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
              >
                {t.login}
              </a>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? (locale === 'vi' ? 'Đóng menu' : 'Close menu') : locale === 'vi' ? 'Mở menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleLink(e, item.href)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/submissions"
              onClick={(e) => handleLink(e, '/submissions')}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {t.navSubmissions}
            </a>
            {isStaff && (
              <a
                href="/admin"
                onClick={(e) => handleLink(e, '/admin')}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {t.navAdmin}
              </a>
            )}
            <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 px-1">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{theme === 'dark' ? t.themeLight : t.themeDark}</span>
              </button>
              <button
                type="button"
                onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{locale.toUpperCase()}</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100 font-display">DuckOJ</span>
            <span aria-hidden="true">·</span>
            <span>
              {locale === 'vi'
                ? 'Nền tảng học lập trình thi đấu & máy chấm trực tuyến'
                : 'Competitive Programming Learning & Online Judge'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/submissions"
              onClick={(e) => handleLink(e, '/submissions')}
              className="hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
            >
              {t.navSubmissions}
            </a>
            <a
              href="/privacy"
              onClick={(e) => handleLink(e, '/privacy')}
              className="hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
            >
              {locale === 'vi' ? 'Quyền riêng tư' : 'Privacy'}
            </a>
            <a
              href="/terms"
              onClick={(e) => handleLink(e, '/terms')}
              className="hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
            >
              {locale === 'vi' ? 'Điều khoản' : 'Terms'}
            </a>
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
            >
              {t.reportIssue}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t.themeLight : t.themeDark}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 whitespace-nowrap"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{theme === 'dark' ? (locale === 'vi' ? 'Sáng' : 'Light') : locale === 'vi' ? 'Tối' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
              aria-label={locale === 'vi' ? 'Chuyển sang tiếng Anh' : 'Switch to Vietnamese'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{locale.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </footer>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
