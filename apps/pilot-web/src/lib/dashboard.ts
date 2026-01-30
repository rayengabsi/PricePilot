/**
 * Dashboard helpers: derive stats and activity from GET /api/alerts
 */

import type { Alert } from './api';

const MS_24H = 24 * 60 * 60 * 1000;

export function getCurrentPrice(alert: Alert): number | null {
  const prices = alert.product?.prices;
  if (!prices?.length) return null;
  return Math.min(
    ...prices.map((p) => (typeof p.price === 'number' ? p.price : Number(p.price)))
  );
}

export function getPriceDrop(alert: Alert): number | null {
  if (alert.status !== 'triggered') return null;
  const current = getCurrentPrice(alert);
  if (current == null) return null;
  const target = Number(alert.targetPrice);
  return Math.max(0, target - current);
}

export function getMoneySaved(alerts: Alert[]): number {
  const triggered = alerts.filter((a) => a.status === 'triggered');
  let sum = 0;
  for (const a of triggered) {
    const drop = getPriceDrop(a);
    if (drop != null) sum += drop;
  }
  return sum;
}

export function getTriggeredLast24h(alerts: Alert[]): Alert[] {
  const cutoff = Date.now() - MS_24H;
  return alerts.filter((a) => {
    if (a.status !== 'triggered' || !a.triggeredAt) return false;
    return new Date(a.triggeredAt).getTime() >= cutoff;
  });
}

export function getProductsTracked(alerts: Alert[]): number {
  const ids = new Set(alerts.map((a) => a.productId));
  return ids.size;
}

export type ActivityType = 'created' | 'triggered';

export interface ActivityEvent {
  type: ActivityType;
  date: string;
  productName: string;
  alertId: string;
  description: string;
}

export function getActivityEvents(alerts: Alert[], limit = 10): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const a of alerts) {
    const name = a.product?.name ?? 'Unknown product';
    events.push({
      type: 'created',
      date: a.createdAt,
      productName: name,
      alertId: a.id,
      description: `Alert created for ${name}`,
    });
    if (a.status === 'triggered' && a.triggeredAt) {
      events.push({
        type: 'triggered',
        date: a.triggeredAt,
        productName: name,
        alertId: a.id,
        description: `Price drop! ${name} hit your target`,
      });
    }
  }
  events.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());
  return events.slice(0, limit);
}

export function formatRelativeTime(date: string): string {
  const d = new Date(date);
  const now = Date.now();
  const ms = now - d.getTime();
  if (ms < 60_000) return 'Just now';
  if (ms < 3600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86400_000) return `${Math.floor(ms / 3600_000)}h ago`;
  if (ms < 604800_000) return `${Math.floor(ms / 86400_000)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
