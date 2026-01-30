'use client';

import type { Alert } from '@/lib/api';

interface AlertCardProps {
  alert: Alert;
  onDelete: (alert: Alert) => void;
}

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function getCurrentPrice(alert: Alert): number | null {
  const prices = alert.product?.prices;
  if (!prices?.length) return null;
  return Math.min(...prices.map((p) => (typeof p.price === 'number' ? p.price : Number(p.price))));
}

export function AlertCard({ alert, onDelete }: AlertCardProps) {
  const currentPrice = getCurrentPrice(alert);
  const isTriggered = alert.status === 'triggered';

  return (
    <div className="card flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
          {alert.product?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={alert.product.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl text-slate-400">
              📦
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-medium text-slate-900 dark:text-white" title={alert.product?.name ?? 'Product'}>
            {alert.product?.name ?? 'Unknown product'}
          </p>
          {alert.product?.brand && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{alert.product.brand}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <span className="text-slate-600 dark:text-slate-300">
              Current: <strong>{currentPrice != null ? `$${currentPrice.toFixed(2)}` : '—'}</strong>
            </span>
            <span
              className={isTriggered ? 'text-green-600 dark:text-green-400' : 'text-pilot-600 dark:text-pilot-400'}
            >
              Target: <strong>${Number(alert.targetPrice).toFixed(2)}</strong>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Created {formatDate(alert.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            isTriggered
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          }`}
        >
          {isTriggered ? 'Triggered' : 'Active'}
        </span>
        <button
          type="button"
          onClick={() => onDelete(alert)}
          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          aria-label={isTriggered ? 'Dismiss alert' : 'Delete alert'}
        >
          {isTriggered ? 'Dismiss' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
