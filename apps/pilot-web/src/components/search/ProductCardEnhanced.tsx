'use client';

import { useState, useMemo } from 'react';
import { Heart, Bell, GitCompare, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product, Price } from '@/lib/api';

/** Derive a stable pseudo-rating (3–5) from product id for demo filtering. */
function getDisplayRating(productId: string): number {
  let h = 0;
  for (let i = 0; i < productId.length; i++) h = (h << 5) - h + productId.charCodeAt(i);
  return 3 + (Math.abs(h) % 3); // 3, 4, or 5
}

interface ProductCardEnhancedProps {
  product: Product;
  source: 'Database' | 'Best Buy';
  canCreateAlert: boolean;
  onCreateAlert: () => void;
  isBestValue: boolean;
  isTrending: boolean;
  isInCompare: boolean;
  onCompareToggle: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  compareCount: number;
  maxCompare: number;
}

export function ProductCardEnhanced({
  product,
  source,
  canCreateAlert,
  onCreateAlert,
  isBestValue,
  isTrending,
  isInCompare,
  onCompareToggle,
  isFavorite,
  onFavoriteToggle,
  compareCount,
  maxCompare,
}: ProductCardEnhancedProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const lowestPrice = product.prices?.length
    ? Math.min(...product.prices.map((p) => p.price))
    : null;
  const bestPrice = product.prices?.length
    ? product.prices.reduce((best, p) => (p.price < best.price ? p : best), product.prices[0])
    : null;
  const limitedStock =
    product.prices?.some((p) => p.inStock === false) || product.prices?.length === 0;
  const displayRating = useMemo(() => getDisplayRating(product.id), [product.id]);

  const badges = useMemo(() => {
    const b: { label: string; className: string }[] = [];
    if (isBestValue) b.push({ label: 'Best Value', className: 'bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300' });
    if (isTrending) b.push({ label: 'Trending', className: 'bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300' });
    if (limitedStock) b.push({ label: 'Limited Stock', className: 'bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-300' });
    return b;
  }, [isBestValue, isTrending, limitedStock]);

  const canAddCompare = !isInCompare && compareCount < maxCompare;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card transition hover:border-pilot-300 hover:shadow-card-hover dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-pilot-600"
    >
      {/* Image + source badge + quick actions */}
      <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-neutral-400">
            📦
          </div>
        )}
        <span
          className={cn(
            'absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium',
            source === 'Database'
              ? 'bg-pilot-100 text-pilot-800 dark:bg-pilot-900/50 dark:text-pilot-200'
              : 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200'
          )}
        >
          {source}
        </span>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {badges.map((b) => (
            <span
              key={b.label}
              className={cn('rounded-full px-2 py-0.5 text-xs font-medium', b.className)}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* Quick actions on hover */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFavoriteToggle(); }}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110 dark:bg-neutral-800/95',
              isFavorite ? 'text-danger-500' : 'text-neutral-600 dark:text-neutral-400'
            )}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCompareToggle(); }}
            disabled={!canAddCompare && !isInCompare}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110 disabled:opacity-50 dark:bg-neutral-800/95',
              isInCompare ? 'text-pilot-600 dark:text-pilot-400' : 'text-neutral-600 dark:text-neutral-400'
            )}
            aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
          >
            <GitCompare className={cn('h-4 w-4', isInCompare && 'fill-current')} />
          </button>
          {canCreateAlert && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onCreateAlert(); }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-neutral-600 shadow-md transition hover:scale-110 hover:text-pilot-600 dark:bg-neutral-800/95 dark:text-neutral-400 dark:hover:text-pilot-400"
              aria-label="Create price alert"
            >
              <Bell className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-neutral-900 dark:text-white" title={product.name}>
          {product.name}
        </h3>
        {product.brand && (
          <p className="mt-0.5 text-body-sm text-neutral-500 dark:text-neutral-400">{product.brand}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {lowestPrice != null && bestPrice && (
            <span className="text-lg font-semibold text-pilot-600 dark:text-pilot-400">
              ${lowestPrice.toFixed(2)}
              <span className="ml-1 text-body-sm font-normal text-neutral-500 dark:text-neutral-400">
                at {bestPrice.store}
              </span>
            </span>
          )}
          <span className="text-body-sm text-neutral-400 dark:text-neutral-500" title="Display rating">
            ★ {displayRating}
          </span>
        </div>

        {/* Price history tooltip trigger */}
        {product.prices && product.prices.length > 1 && (
          <div
            className="relative mt-2"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              type="button"
              className="inline-flex items-center gap-1 text-body-sm text-neutral-500 hover:text-pilot-600 dark:text-neutral-400 dark:hover:text-pilot-400"
            >
              <History className="h-3.5 w-3.5" />
              Price by store
            </button>
            {showTooltip && (
              <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-xl border border-neutral-200 bg-white p-3 shadow-elevated dark:border-neutral-700 dark:bg-neutral-800">
                <p className="mb-2 text-body-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Current prices
                </p>
                <ul className="space-y-1">
                  {product.prices.map((p: Price) => (
                    <li key={p.store} className="flex justify-between text-body-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">{p.store}</span>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        ${p.price.toFixed(2)}
                        {!p.inStock && (
                          <span className="ml-1 text-danger-500">(out of stock)</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-4">
          {canCreateAlert ? (
            <button
              type="button"
              onClick={onCreateAlert}
              className="btn-primary w-full"
            >
              Create Alert
            </button>
          ) : (
            <p className="text-center text-body-sm text-neutral-500 dark:text-neutral-400">
              Alert only for catalog products
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
