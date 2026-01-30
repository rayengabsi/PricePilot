'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { alertsApi, getApiErrorMessage, type Alert } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useAlertCountStore } from '@/lib/alert-count-store';
import {
  getActivityEvents,
  getMoneySaved,
  getTriggeredLast24h,
  getProductsTracked,
} from '@/lib/dashboard';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { PriceDropCard } from '@/components/dashboard/PriceDropCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import {
  StatCardSkeleton,
  ActivityFeedSkeleton,
  PriceDropCardSkeleton,
} from '@/components/dashboard/DashboardSkeletons';
import {
  DashboardFirstTimeEmpty,
  NoPriceDropsEmpty,
} from '@/components/dashboard/DashboardEmptyStates';

const REFRESH_MS = 2 * 60 * 1000;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const fetchCount = useAlertCountStore((s) => s.fetchCount);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await alertsApi.getAlerts();
      const list = (res.data.data ?? []) as Alert[];
      const visible = list.filter(
        (a) => a.status === 'active' || a.status === 'triggered'
      );
      setAlerts(visible);
      await fetchCount();
    } catch (err) {
      setError(getApiErrorMessage(err));
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchCount]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    const t = setInterval(fetchAlerts, REFRESH_MS);
    return () => clearInterval(t);
  }, [fetchAlerts]);

  const activeAlerts = alerts.filter((a) => a.status === 'active' && a.isActive);
  const triggeredAlerts = alerts
    .filter((a) => a.status === 'triggered')
    .sort((a, b) => {
      const at = a.triggeredAt ? new Date(a.triggeredAt).getTime() : 0;
      const bt = b.triggeredAt ? new Date(b.triggeredAt).getTime() : 0;
      return bt - at;
    });
  const triggered24h = getTriggeredLast24h(alerts);
  const moneySaved = getMoneySaved(alerts);
  const productsTracked = getProductsTracked(alerts);
  const activityEvents = getActivityEvents(alerts, 10);

  const isFirstTime = !loading && alerts.length === 0 && !error;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Welcome back{user?.name ? `, ${user.name}` : ''}!
      </p>

      {error && (
        <div
          className="mt-6 max-w-2xl rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {isFirstTime && (
        <div className="mt-8">
          <DashboardFirstTimeEmpty />
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Quick actions
            </h2>
            <QuickActions />
          </div>
        </div>
      )}

      {!isFirstTime && (
        <>
          {loading ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Active alerts"
                value={activeAlerts.length}
                sub={
                  activeAlerts.length === 0
                    ? 'Start tracking prices'
                    : `${productsTracked} product${productsTracked !== 1 ? 's' : ''} tracked`
                }
                href="/alerts"
                icon="bell"
                accent="pilot"
              />
              <StatCard
                title="Triggered (24h)"
                value={triggered24h.length}
                sub={triggered24h.length > 0 ? 'Price drops in last 24 hours' : undefined}
                href="/alerts"
                icon="trending"
                accent="success"
              />
              <StatCard
                title="Money saved"
                value={moneySaved > 0 ? `$${moneySaved.toFixed(2)}` : '$0.00'}
                sub={moneySaved > 0 ? 'From triggered alerts' : undefined}
                icon="dollar"
                accent="warning"
              />
              <StatCard
                title="Products tracked"
                value={productsTracked}
                sub={activeAlerts.length > 0 ? 'Unique products' : undefined}
                href="/alerts"
                icon="package"
                accent="sky"
              />
            </div>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <section className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent activity
                </h2>
                {activityEvents.length > 0 && (
                  <Link
                    href="/alerts"
                    className="text-sm font-medium text-pilot-600 hover:text-pilot-700 dark:text-pilot-400 dark:hover:text-pilot-300"
                  >
                    View all
                  </Link>
                )}
              </div>
              {loading ? (
                <ActivityFeedSkeleton />
              ) : (
                <ActivityFeed
                  events={activityEvents}
                  emptyMessage="No recent activity. Create an alert from Search."
                />
              )}
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent price drops
                </h2>
                {triggeredAlerts.length > 0 && (
                  <Link
                    href="/alerts"
                    className="text-sm font-medium text-pilot-600 hover:text-pilot-700 dark:text-pilot-400 dark:hover:text-pilot-300"
                  >
                    View all
                  </Link>
                )}
              </div>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {[...Array(3)].map((_, i) => (
                    <PriceDropCardSkeleton key={i} />
                  ))}
                </div>
              ) : triggeredAlerts.length === 0 ? (
                <NoPriceDropsEmpty />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {triggeredAlerts.slice(0, 4).map((a) => (
                    <PriceDropCard key={a.id} alert={a} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Quick actions
            </h2>
            <QuickActions />
          </section>
        </>
      )}
    </div>
  );
}
