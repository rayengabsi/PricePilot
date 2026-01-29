/**
 * Alert count for header badge
 * Fetched from GET /api/alerts; refresh after creating/deleting alerts
 */

import { create } from 'zustand';
import { alertsApi } from './api';

interface AlertCountState {
  count: number;
  isLoading: boolean;
  fetchCount: () => Promise<void>;
}

export const useAlertCountStore = create<AlertCountState>((set) => ({
  count: 0,
  isLoading: false,
  fetchCount: async () => {
    set({ isLoading: true });
    try {
      const res = await alertsApi.getAlerts({ isActive: true });
      set({ count: res.data.count ?? res.data.data?.length ?? 0 });
    } catch {
      set({ count: 0 });
    } finally {
      set({ isLoading: false });
    }
  },
}));
