'use client';

import { Button } from '@/components/ui/Button';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  const isDanger = variant === 'danger';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-pilot-lg dark:border-slate-700 dark:bg-slate-800">
        <h2 id="confirm-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDanger ? 'danger' : 'primary'}
            fullWidth
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
