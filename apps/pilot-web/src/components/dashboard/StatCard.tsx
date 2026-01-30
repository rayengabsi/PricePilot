'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bell,
  TrendingDown,
  DollarSign,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { cn } from '@/lib/utils';

const iconMap = {
  bell: Bell,
  trending: TrendingDown,
  dollar: DollarSign,
  package: Package,
} as const;

type IconKey = keyof typeof iconMap;

interface StatCardProps {
  title: string;
  value: number | string;
  sub?: string;
  href?: string;
  icon: IconKey;
  accent?: 'pilot' | 'success' | 'warning' | 'sky';
  trend?: { value: number; label?: string };
  progress?: { value: number; label?: string };
  animateValue?: boolean;
}

const gradientBg = {
  pilot:
    'from-pilot-500/10 via-pilot-500/5 to-transparent dark:from-pilot-500/20 dark:via-pilot-500/10',
  success:
    'from-success-500/10 via-success-500/5 to-transparent dark:from-success-500/20 dark:via-success-500/10',
  warning:
    'from-warning-500/10 via-warning-500/5 to-transparent dark:from-warning-500/20 dark:via-warning-500/10',
  sky: 'from-sky-500/10 via-sky-500/5 to-transparent dark:from-sky-500/20 dark:via-sky-500/10',
};

const iconStyles = {
  pilot: 'bg-pilot-500/15 text-pilot-600 dark:bg-pilot-400/20 dark:text-pilot-400',
  success: 'bg-success-500/15 text-success-600 dark:bg-success-400/20 dark:text-success-400',
  warning: 'bg-warning-500/15 text-warning-600 dark:bg-warning-400/20 dark:text-warning-400',
  sky: 'bg-sky-500/15 text-sky-600 dark:bg-sky-400/20 dark:text-sky-400',
};

export function StatCard({
  title,
  value,
  sub,
  href,
  icon,
  accent = 'pilot',
  trend,
  progress,
  animateValue = true,
}: StatCardProps) {
  const Icon = iconMap[icon] ?? Bell;
  const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0;
  const isFormatted = typeof value === 'string' && (value.startsWith('$') || value.includes('%'));
  const showCounter = animateValue && typeof value === 'number' && !Number.isNaN(numValue);

  const content = (
    <>
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-80 dark:opacity-60', gradientBg[accent])} />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <span className="text-body-sm font-medium text-neutral-500 dark:text-neutral-400">
            {title}
          </span>
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              iconStyles[accent]
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          {showCounter ? (
            <AnimatedCounter value={numValue} className="text-2xl font-bold text-neutral-900 dark:text-white" />
          ) : (
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</span>
          )}
          {trend != null && (
            <span
              className={cn(
                'text-body-sm font-medium',
                trend.value >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
              )}
              aria-label={trend.label}
            >
              {trend.value >= 0 ? '↑' : '↓'}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {sub != null && (
          <p className="text-body-sm text-neutral-500 dark:text-neutral-400">{sub}</p>
        )}
        {progress != null && progress.value > 0 && (
          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <motion.div
                className={cn('h-full rounded-full', {
                  'bg-pilot-500': accent === 'pilot',
                  'bg-success-500': accent === 'success',
                  'bg-warning-500': accent === 'warning',
                  'bg-sky-500': accent === 'sky',
                })}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress.value)}%` }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              />
            </div>
            {progress.label != null && (
              <p className="text-caption text-neutral-500 dark:text-neutral-400">{progress.label}</p>
            )}
          </div>
        )}
      </div>
    </>
  );

  const wrapperClass = cn(
    'relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-card transition dark:border-neutral-800 dark:bg-neutral-900',
    'hover:border-pilot-200 hover:shadow-card-hover dark:hover:border-pilot-800'
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <motion.div
          className={wrapperClass}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          {content}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      className={wrapperClass}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </motion.div>
  );
}
