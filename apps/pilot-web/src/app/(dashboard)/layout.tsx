'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';

/**
 * Dashboard layout: wraps all protected routes with AuthGuard
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
