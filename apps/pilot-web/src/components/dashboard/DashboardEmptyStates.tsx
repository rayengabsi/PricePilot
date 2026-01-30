'use client';

import Link from 'next/link';

export function DashboardFirstTimeEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mb-4 text-5xl" aria-hidden="true">
        🚀
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Welcome! Create your first alert</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        Search for a product, set your target price, and we&apos;ll notify you when it drops.
      </p>
      <Link
        href="/search"
        className="mt-6 inline-flex items-center rounded-lg bg-pilot-600 px-4 py-2.5 text-sm font-medium text-white shadow-pilot hover:bg-pilot-700"
      >
        Search products
      </Link>
    </div>
  );
}

export function NoPriceDropsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 text-3xl" aria-hidden="true">
        📉
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white">No price drops yet</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        When your alerts trigger, they&apos;ll show up here.
      </p>
    </div>
  );
}

export function NoActiveAlertsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 text-3xl" aria-hidden="true">
        🔔
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white">Start tracking prices</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Create alerts from Search to get notified when prices drop.
      </p>
      <Link href="/search" className="link-pilot mt-3 text-sm">
        Search products
      </Link>
    </div>
  );
}
