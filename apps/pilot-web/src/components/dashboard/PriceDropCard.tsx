'use client';

import Link from 'next/link';
import type { Alert } from '@/lib/api';
import { getPriceDrop } from '@/lib/dashboard';

interface PriceDropCardProps {
  alert: Alert;
}

export function PriceDropCard({ alert }: PriceDropCardProps) {
  const drop = getPriceDrop(alert);
  const name = alert.product?.name ?? 'Unknown product';

  return (
    <div className="card flex flex-col gap-3 transition hover:border-pilot-300 hover:shadow-pilot dark:hover:border-pilot-600">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
        {alert.product?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={alert.product.imageUrl}
            alt=""
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-slate-400">
            📦
          </div>
        )}
        {drop != null && drop > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-green-600 px-2 py-0.5 text-xs font-semibold text-white">
            −${drop.toFixed(2)}
          </span>
        )}
      </div>
      <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-white" title={name}>
        {name}
      </p>
      {drop != null && drop > 0 && (
        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
          You saved ${drop.toFixed(2)}
        </p>
      )}
      <Link
        href="/search"
        className="mt-auto rounded-lg border border-pilot-200 bg-pilot-50 py-2 text-center text-sm font-medium text-pilot-700 transition hover:bg-pilot-100 dark:border-pilot-700 dark:bg-pilot-900/30 dark:text-pilot-300 dark:hover:bg-pilot-900/50"
      >
        View details
      </Link>
    </div>
  );
}
