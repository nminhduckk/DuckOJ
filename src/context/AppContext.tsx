import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiFetch, refreshSession, setAccessToken } from '../lib/api';
import { MESSAGES, type Locale } from '../lib/i18n';
import type { UserProfile } from '../types/duckoj';

interface AppContextValue {
  user: UserProfile | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: { email: string; password: string; name: string; handle: string }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (typeof MESSAGES)['vi'] | (typeof MESSAGES)['en'];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentPath: string;
  pathname: string;
  search: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('duckoj_locale') : null;
    return saved === 'en' ? 'en' : 'vi';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = window.localStorage.getItem('duckoj_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.colorScheme = theme;
    window.localStorage.setItem('duckoj_theme', theme);
  }, [theme]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem('duckoj_locale', l);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const target = to.startsWith('/') ? to : `/${to}`;
    if (options?.replace) {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }
    setCurrentPath(window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const onPop = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = await refreshSession();
      if (!token) {
        setUser(null);
        return;
      }
      const me = await apiFetch<UserProfile>('/me', { skipRetry: true });
      setUser(me);
    } catch {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await refreshSession();
        if (token && active) {
          const me = await apiFetch<UserProfile>('/me', { skipRetry: true });
          if (active) setUser(me);
        }
      } catch {
        if (active) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (active) setAuthLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ access_token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipRetry: true,
    });
    setAccessToken(res.access_token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (payload: { email: string; password: string; name: string; handle: string }) => {
      const res = await apiFetch<{ access_token: string; user: UserProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipRetry: true,
      });
      setAccessToken(res.access_token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST', skipRetry: true });
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  const qIdx = currentPath.indexOf('?');
  const pathname = qIdx === -1 ? currentPath : currentPath.slice(0, qIdx);
  const search = qIdx === -1 ? '' : currentPath.slice(qIdx);

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        login,
        register,
        logout,
        refreshUser,
        locale,
        setLocale,
        t: MESSAGES[locale],
        theme,
        toggleTheme,
        currentPath,
        pathname,
        search,
        navigate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
