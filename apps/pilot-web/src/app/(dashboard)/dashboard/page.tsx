'use client';

import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Welcome back{user?.name ? `, ${user.name}` : ''}!
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/search"
          className="card block transition hover:border-pilot-400 hover:shadow-pilot dark:hover:border-pilot-500"
        >
          <span className="text-2xl">🔍</span>
          <h2 className="mt-3 font-semibold text-slate-900 dark:text-white">Search products</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Find products and compare prices across stores.
          </p>
        </Link>
        <Link
          href="/alerts"
          className="card block transition hover:border-pilot-400 hover:shadow-pilot dark:hover:border-pilot-500"
        >
          <span className="text-2xl">🔔</span>
          <h2 className="mt-3 font-semibold text-slate-900 dark:text-white">Price alerts</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            View and manage your price alerts. See triggered alerts.
          </p>
        </Link>
        <Link
          href="/profile"
          className="card block transition hover:border-pilot-400 hover:shadow-pilot dark:hover:border-pilot-500"
        >
          <span className="text-2xl">👤</span>
          <h2 className="mt-3 font-semibold text-slate-900 dark:text-white">Profile</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Update your settings and email preferences.
          </p>
        </Link>
      </div>
    </div>
  );
}
