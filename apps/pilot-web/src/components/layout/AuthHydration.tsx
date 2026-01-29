'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';

/**
 * After mount, sync Zustand persist state with localStorage and mark hydrated.
 * Ensures AuthGuard and header know auth state after client rehydration.
 */
export function AuthHydration() {
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    setHydrated();
  }, [setHydrated]);

  return null;
}
