import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LearnPage } from './pages/LearnPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { ContestsPage } from './pages/ContestsPage';
import { ContestDetailPage } from './pages/ContestDetailPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { PrivacyPage, TermsPage } from './pages/LegalPages';

function DuckRouter() {
  const { pathname, locale, navigate } = useApp();
  const clean = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (clean === '/' || clean === '') return <HomePage />;
  if (clean === '/roadmap') return <RoadmapPage />;
  if (clean === '/learn') return <LearnPage />;
  if (clean.startsWith('/learn/')) {
    const slug = decodeURIComponent(clean.slice('/learn/'.length));
    if (slug) return <LessonDetailPage slug={slug} />;
  }
  if (clean === '/problems') return <ProblemsPage />;
  if (clean.startsWith('/problems/')) {
    const slug = decodeURIComponent(clean.slice('/problems/'.length));
    if (slug) return <ProblemDetailPage slug={slug} />;
  }
  if (clean === '/contests') return <ContestsPage />;
  if (clean.startsWith('/contests/')) {
    const slug = decodeURIComponent(clean.slice('/contests/'.length));
    if (slug) return <ContestDetailPage slug={slug} />;
  }
  if (clean === '/submissions') return <SubmissionsPage />;
  if (clean === '/me') return <DashboardPage />;
  if (clean === '/admin') return <AdminPage />;
  if (clean === '/login') return <LoginPage />;
  if (clean === '/register') return <RegisterPage />;
  if (clean === '/privacy') return <PrivacyPage />;
  if (clean === '/terms') return <TermsPage />;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
      <p className="font-mono text-sm text-amber-700 dark:text-amber-400">404</p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
        {locale === 'vi' ? 'Không tìm thấy trang' : 'Page Not Found'}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {locale === 'vi'
          ? 'Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.'
          : 'The page you requested does not exist.'}
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-sm font-semibold"
      >
        {locale === 'vi' ? 'Về trang chủ' : 'Back to Home'}
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Layout>
        <DuckRouter />
      </Layout>
    </AppProvider>
  );
}
