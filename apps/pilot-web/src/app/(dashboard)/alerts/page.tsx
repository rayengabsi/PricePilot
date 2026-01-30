'use client';

import { useState, useEffect, useCallback } from 'react';
import { alertsApi, getApiErrorMessage, type Alert } from '@/lib/api';
import { useAlertCountStore } from '@/lib/alert-count-store';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Toast } from '@/components/ui/Toast';
import { AlertTableRow } from '@/components/alerts/AlertTableRow';
import { AlertCard } from '@/components/alerts/AlertCard';
import { AlertRowSkeleton, AlertCardSkeleton } from '@/components/alerts/AlertSkeleton';
import { AlertEmptyState } from '@/components/alerts/AlertEmptyState';

const POLL_INTERVAL_MS = 5 * 60 * 1000;

function sortAlerts(alerts: Alert[]): Alert[] {
  const triggered = alerts
    .filter((a) => a.status === 'triggered')
    .sort((a, b) => {
      const at = a.triggeredAt ? new Date(a.triggeredAt).getTime() : 0;
      const bt = b.triggeredAt ? new Date(b.triggeredAt).getTime() : 0;
      return bt - at;
    });
  const active = alerts
    .filter((a) => a.status === 'active' && a.isActive)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return [...triggered, ...active];
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Alert | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fetchCount = useAlertCountStore((s) => s.fetchCount);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alertsApi.getAlerts();
      const list = res.data.data ?? [];
      const visible = list.filter(
        (a) => a.status === 'active' || a.status === 'triggered'
      ) as Alert[];
      setAlerts(sortAlerts(visible));
    } catch (err) {
      setError(getApiErrorMessage(err));
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    const t = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchAlerts]);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
  }

  function handleDeleteClick(alert: Alert) {
    setDeleteTarget(alert);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await alertsApi.deleteAlert(deleteTarget.id);
      await fetchCount();
      setAlerts((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('success', deleteTarget.status === 'triggered' ? 'Alert dismissed.' : 'Alert deleted.');
    } catch (err) {
      showToast('error', getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  function handleDeleteCancel() {
    if (!deleting) setDeleteTarget(null);
  }

  const triggered = alerts.filter((a) => a.status === 'triggered');
  const active = alerts.filter((a) => a.status === 'active' && a.isActive);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Price alerts</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Manage your alerts. We notify you when prices drop to your target.
      </p>

      {error && (
        <div
          className="mt-6 max-w-2xl rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-8 space-y-4">
          <div className="hidden overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 dark:border-slate-700 lg:block">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Current
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, i) => (
                  <AlertRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-4 lg:hidden">
            {[...Array(4)].map((_, i) => (
              <AlertCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {!loading && alerts.length === 0 && !error && (
        <div className="mt-8">
          <AlertEmptyState />
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="mt-8 space-y-10">
          {triggered.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  🔔
                </span>
                Triggered alerts
              </h2>
              <div className="hidden overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 dark:border-slate-700 lg:block">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Current
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Target
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {triggered.map((a) => (
                      <AlertTableRow key={a.id} alert={a} onDelete={handleDeleteClick} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4 lg:hidden">
                {triggered.map((a) => (
                  <AlertCard key={a.id} alert={a} onDelete={handleDeleteClick} />
                ))}
              </div>
            </section>
          )}

          {active.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  ✓
                </span>
                Active alerts
              </h2>
              <div className="hidden overflow-x-auto overflow-y-hidden rounded-xl border border-slate-200 dark:border-slate-700 lg:block">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Current
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Target
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((a) => (
                      <AlertTableRow key={a.id} alert={a} onDelete={handleDeleteClick} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4 lg:hidden">
                {active.map((a) => (
                  <AlertCard key={a.id} alert={a} onDelete={handleDeleteClick} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title={deleteTarget.status === 'triggered' ? 'Dismiss alert?' : 'Delete alert?'}
          message={
            deleteTarget.status === 'triggered'
              ? 'This will remove the alert from your list. You can create a new one from Search if you want to track the price again.'
              : 'This will cancel the price alert. You can create a new one from Search anytime.'
          }
          confirmLabel={deleteTarget.status === 'triggered' ? 'Dismiss' : 'Delete'}
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deleting}
        />
      )}

      <Toast
        type={toast?.type ?? 'success'}
        message={toast?.message ?? ''}
        visible={!!toast}
        onDismiss={() => setToast(null)}
        duration={4000}
      />
    </div>
  );
}
