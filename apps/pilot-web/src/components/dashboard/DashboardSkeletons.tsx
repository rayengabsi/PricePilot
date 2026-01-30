'use client';

import { Shimmer } from '@/components/ui/Shimmer';
import { cn } from '@/lib/utils';

export function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-10 w-10 rounded-xl" />
      </div>
      <Shimmer className="mt-4 h-8 w-16 rounded-lg" />
      <Shimmer className="mt-2 h-3 w-20 rounded" />
    </div>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <div className="space-y-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex gap-4 px-4 py-3',
            i < 4 && 'border-b border-neutral-100 dark:border-neutral-700'
          )}
        >
          <Shimmer className="h-8 w-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-4 max-w-[75%] flex-1 rounded" />
            <Shimmer className="h-3 w-full rounded" />
            <Shimmer className="h-3 w-16 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PriceDropCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <Shimmer className="aspect-square w-full rounded-xl" />
      <Shimmer className="mt-4 h-4 w-full rounded" />
      <Shimmer className="mt-2 h-3 w-20 rounded" />
      <Shimmer className="mt-4 h-10 w-full rounded-xl" />
    </div>
  );
}
