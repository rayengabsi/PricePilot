'use client';

import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className = '' }: ShimmerProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800', className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
        style={{ animation: 'shimmer 2s ease-in-out infinite' }}
      />
    </div>
  );
}
