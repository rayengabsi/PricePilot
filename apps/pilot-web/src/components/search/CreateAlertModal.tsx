'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { alertsApi, getApiErrorMessage, type Product } from '@/lib/api';
import { useAlertCountStore } from '@/lib/alert-count-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  targetPrice: z.coerce.number().positive('Enter a positive number').finite(),
});

type FormData = z.infer<typeof schema>;

interface CreateAlertModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

function getCurrentPrice(product: Product): number | null {
  if (!product.prices?.length) return null;
  const prices = product.prices.map((p) => p.price);
  return Math.min(...prices);
}

export function CreateAlertModal({ product, onClose, onSuccess, onError }: CreateAlertModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fetchCount = useAlertCountStore((s) => s.fetchCount);
  const currentPrice = getCurrentPrice(product);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      targetPrice: currentPrice ?? 0,
    },
  });

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    try {
      await alertsApi.createAlert(product.id, data.targetPrice);
      await fetchCount();
      onSuccess();
      onClose();
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setSubmitError(msg);
      onError(msg);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="create-alert-title">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-pilot-lg dark:border-slate-700 dark:bg-slate-800">
        <h2 id="create-alert-title" className="text-lg font-semibold text-slate-900 dark:text-white">
          Create price alert
        </h2>
        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400" title={product.name}>
          {product.name}
        </p>
        {currentPrice != null && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Current lowest price: <span className="font-semibold text-pilot-600 dark:text-pilot-400">${currentPrice.toFixed(2)}</span>
          </p>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <Input
            label="Target price (USD)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 799.99"
            error={errors.targetPrice?.message}
            {...register('targetPrice')}
          />
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400" role="alert">
              {submitError}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Create alert
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
