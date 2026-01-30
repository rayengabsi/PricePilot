'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hover = false, gradient = false, ...props }, ref) => {
    const base =
      'rounded-2xl border border-neutral-200 bg-white p-6 shadow-card transition dark:border-neutral-800 dark:bg-neutral-900';
    const hoverClass = hover
      ? 'hover:border-pilot-200 hover:shadow-card-hover dark:hover:border-pilot-800'
      : '';
    const gradientClass = gradient
      ? 'bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-950'
      : '';

    return (
      <motion.div
        ref={ref}
        initial={false}
        whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
        className={cn(base, hoverClass, gradientClass, className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
