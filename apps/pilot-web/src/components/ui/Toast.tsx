'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  progress?: boolean;
}

const config = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-success-500',
    text: 'text-white',
  },
  error: {
    icon: XCircle,
    bg: 'bg-danger-500',
    text: 'text-white',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-warning-500',
    text: 'text-white',
  },
};

export function Toast({
  type,
  message,
  visible,
  onDismiss,
  duration = 4000,
  progress = true,
}: ToastProps) {
  const Icon = config[type].icon;

  useEffect(() => {
    if (!visible || duration <= 0) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [visible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 24, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 24, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-sm overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-elevated dark:border-neutral-800 dark:bg-neutral-900"
          role="status"
          aria-live="polite"
        >
          <div className={cn('flex items-center gap-3 px-4 py-3', config[type].bg, config[type].text)}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-lg p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {progress && (
            <div className="h-1 bg-neutral-100 dark:bg-neutral-800">
              <motion.div
                className={cn('h-full', config[type].bg)}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
