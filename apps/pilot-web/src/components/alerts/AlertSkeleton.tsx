'use client';

export function AlertRowSkeleton() {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-700">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 shrink-0 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </td>
      <td className="py-4">
        <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </td>
      <td className="py-4">
        <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </td>
      <td className="py-4">
        <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
      </td>
      <td className="py-4 text-sm text-slate-500">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </td>
      <td className="py-4">
        <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      </td>
    </tr>
  );
}

export function AlertCardSkeleton() {
  return (
    <div className="card flex gap-4">
      <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-full max-w-[200px] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="flex gap-4 pt-2">
          <div className="h-4 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
