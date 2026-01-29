/**
 * Auth state with Zustand
 * Persists token and user to localStorage on client
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './api';

interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isHydrated: false,
      setAuth: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('pricepilot_token', token);
          localStorage.setItem('pricepilot_user', JSON.stringify(user));
        }
        set({ token, user });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pricepilot_token');
          localStorage.removeItem('pricepilot_user');
        }
        set({ token: null, user: null });
      },
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'pricepilot-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export const useIsAuthenticated = () => {
  const { token, user, isHydrated } = useAuthStore.getState();
  return isHydrated && !!token && !!user;
};
