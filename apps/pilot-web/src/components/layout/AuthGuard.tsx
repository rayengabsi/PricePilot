'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wraps protected pages and redirects to login if not authenticated.
 * Waits for Zustand persist rehydration before deciding.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { token, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!token || !user) {
      router.replace('/login');
    }
  }, [isHydrated, token, user, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!token || !user) {
    return null; // Redirecting
  }

  return <>{children}</>;
}
