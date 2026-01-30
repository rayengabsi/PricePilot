'use client';

export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="mt-3 h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-4 px-4 py-3 ${i < 4 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
        >
          <div className="h-8 w-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PriceDropCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-square w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-3 h-9 w-full rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
