'use client';

import type { Alert } from '@/lib/api';

interface AlertTableRowProps {
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

export function AlertTableRow({ alert, onDelete }: AlertTableRowProps) {
  const currentPrice = getCurrentPrice(alert);
  const isTriggered = alert.status === 'triggered';

  return (
    <tr className="border-b border-slate-200 dark:border-slate-700">
      <td className="py-4 pr-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
            {alert.product?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={alert.product.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl text-slate-400">
                📦
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900 dark:text-white" title={alert.product?.name ?? 'Product'}>
              {alert.product?.name ?? 'Unknown product'}
            </p>
            {alert.product?.brand && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{alert.product.brand}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-4">
        <span className="font-medium text-slate-900 dark:text-white">
          {currentPrice != null ? `$${currentPrice.toFixed(2)}` : '—'}
        </span>
      </td>
      <td className="py-4">
        <span
          className={`font-semibold ${isTriggered ? 'text-green-600 dark:text-green-400' : 'text-pilot-600 dark:text-pilot-400'}`}
        >
          ${Number(alert.targetPrice).toFixed(2)}
        </span>
      </td>
      <td className="py-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isTriggered
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          }`}
        >
          {isTriggered ? 'Triggered' : 'Active'}
        </span>
      </td>
      <td className="py-4 text-sm text-slate-500 dark:text-slate-400">
        {formatDate(alert.createdAt)}
      </td>
      <td className="py-4">
        <button
          type="button"
          onClick={() => onDelete(alert)}
          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          aria-label={isTriggered ? 'Dismiss alert' : 'Delete alert'}
        >
          {isTriggered ? 'Dismiss' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}
