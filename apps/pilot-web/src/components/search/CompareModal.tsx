'use client';

import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/api';

interface CompareModalProps {
  products: Product[];
  onClose: () => void;
}

function getLowestPrice(product: Product): number | null {
  if (!product.prices?.length) return null;
  return Math.min(...product.prices.map((p) => p.price));
}

function getBestPrice(product: Product): { store: string; price: number } | null {
  if (!product.prices?.length) return null;
  const best = product.prices.reduce((a, b) => (a.price < b.price ? a : b), product.prices[0]);
  return { store: best.store, price: best.price };
}

export function CompareModal({ products, onClose }: CompareModalProps) {
  const lowestPrices = products.map((p) => getLowestPrice(p));
  const validPrices = lowestPrices.filter((n): n is number => n != null);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-elevated dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-700">
          <h2 id="compare-title" className="text-h3 text-neutral-900 dark:text-white">
            Compare products
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-x-auto overflow-y-auto p-4">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${products.length}, minmax(200px, 1fr))` }}
          >
            {products.map((product, index) => {
              const best = getBestPrice(product);
              const lowest = getLowestPrice(product);
                  const isBestValue =
                    minPrice != null && lowest != null && lowest === minPrice;

              return (
                <div
                  key={product.id}
                  className={cn(
                    'flex flex-col rounded-xl border p-4',
                    isBestValue
                      ? 'border-success-400 bg-success-50/50 dark:border-success-600 dark:bg-success-900/20'
                      : 'border-neutral-200 dark:border-neutral-700'
                  )}
                >
                  <div className="aspect-square w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden mb-3">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl text-neutral-400">
                        📦
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-2">
                    {product.name}
                  </h3>
                  {product.brand && (
                    <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{product.brand}</p>
                  )}
                  <div className="mt-2">
                    {best && (
                      <p className="text-lg font-semibold text-pilot-600 dark:text-pilot-400">
                        ${best.price.toFixed(2)}
                        <span className="text-body-sm font-normal text-neutral-500 dark:text-neutral-400">
                          {' '}
                          at {best.store}
                        </span>
                      </p>
                    )}
                  </div>
                  {product.prices && product.prices.length > 1 && (
                    <ul className="mt-2 space-y-1 text-body-sm text-neutral-600 dark:text-neutral-400">
                      {product.prices.map((p) => (
                        <li key={p.store} className="flex justify-between">
                          <span>{p.store}</span>
                          <span>${p.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {isBestValue && (
                    <span className="mt-3 inline-flex w-fit rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-900/50 dark:text-success-300">
                      Best value
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
