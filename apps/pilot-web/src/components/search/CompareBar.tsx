'use client';

import { GitCompare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/api';

interface CompareBarProps {
  selected: Product[];
  onRemove: (productId: string) => void;
  onCompare: () => void;
  onClear: () => void;
  maxCompare: number;
}

export function CompareBar({
  selected,
  onRemove,
  onCompare,
  onClear,
  maxCompare,
}: CompareBarProps) {
  if (selected.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 left-4 right-4 z-30 lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-md"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-elevated dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex flex-1 items-center gap-2 overflow-hidden">
            {selected.map((p) => (
              <div
                key={p.id}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-8 w-8 rounded object-contain"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-neutral-200 text-lg dark:bg-neutral-700">
                    📦
                  </span>
                )}
                <span className="max-w-[80px] truncate text-body-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {p.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                  aria-label={`Remove ${p.name} from compare`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {selected.length < maxCompare && (
              <span className="text-body-sm text-neutral-500 dark:text-neutral-400">
                Select up to {maxCompare - selected.length} more
              </span>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg px-3 py-2 text-body-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onCompare}
              disabled={selected.length < 2}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl bg-pilot-600 px-4 py-2 text-body-sm font-medium text-white transition hover:bg-pilot-700 disabled:opacity-50 disabled:pointer-events-none'
              )}
            >
              <GitCompare className="h-4 w-4" />
              Compare ({selected.length})
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
