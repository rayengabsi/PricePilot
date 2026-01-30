'use client';

import type { ActivityEvent } from '@/lib/dashboard';
import { formatRelativeTime } from '@/lib/dashboard';

interface ActivityFeedProps {
  events: ActivityEvent[];
  emptyMessage?: string;
}

export function ActivityFeed({ events, emptyMessage = 'No recent activity' }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      {events.map((e, i) => (
        <div
          key={`${e.alertId}-${e.type}-${e.date}`}
          className={`flex gap-4 px-4 py-3 ${i < events.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
        >
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
              e.type === 'triggered'
                ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400'
                : 'bg-pilot-100 text-pilot-600 dark:bg-pilot-900/50 dark:text-pilot-400'
            }`}
          >
            {e.type === 'triggered' ? '🔔' : '➕'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-900 dark:text-white" title={e.productName}>
              {e.productName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{e.description}</p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              {formatRelativeTime(e.date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
