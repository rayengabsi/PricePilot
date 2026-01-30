'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { useAlertCountStore } from '@/lib/alert-count-store';

export function Header() {
  const pathname = usePathname();
  const { user, token, clearAuth } = useAuthStore();
  const { count, fetchCount } = useAlertCountStore();

  const isAuth = !!token && !!user;

  useEffect(() => {
    if (isAuth) fetchCount();
  }, [isAuth, fetchCount]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-pilot-600 dark:text-pilot-400">
            PricePilot
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {isAuth ? (
            <>
              <div className="hidden lg:flex lg:items-center lg:gap-4">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition ${
                  pathname === '/dashboard'
                    ? 'text-pilot-600 dark:text-pilot-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/search"
                className={`text-sm font-medium transition ${
                  pathname === '/search'
                    ? 'text-pilot-600 dark:text-pilot-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Search
              </Link>
              <Link
                href="/alerts"
                className={`relative pr-6 text-sm font-medium transition ${
                  pathname === '/alerts'
                    ? 'text-pilot-600 dark:text-pilot-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Alerts
                {count > 0 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-pilot-600 px-1.5 text-[10px] font-semibold text-white dark:bg-pilot-500">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium transition ${
                  pathname === '/profile'
                    ? 'text-pilot-600 dark:text-pilot-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Profile
              </Link>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {user?.email}
              </span>
              </div>
              <button
                onClick={clearAuth}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-red-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400 lg:px-0 lg:py-0 lg:hover:bg-transparent"
                aria-label="Sign out"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm font-medium transition ${
                  pathname === '/login'
                    ? 'text-pilot-600 dark:text-pilot-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-pilot-600 px-4 py-2 text-sm font-medium text-white shadow-pilot hover:bg-pilot-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
