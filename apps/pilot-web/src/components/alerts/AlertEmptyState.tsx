'use client';

import Link from 'next/link';

export function AlertEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-800/50">
      <div className="mb-4 text-5xl" aria-hidden="true">
        🔔
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No price alerts yet</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
        Search for products and create alerts to get notified when prices drop to your target.
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
