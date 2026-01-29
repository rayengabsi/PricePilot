/**
 * PricePilot API client
 * Connects to backend at http://localhost:3000
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor: attach JWT from localStorage (client-side only)
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('pricepilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// Response interceptor: handle 401 and clear token
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('pricepilot_token');
      localStorage.removeItem('pricepilot_user');
      // Optionally redirect to login
      if (!error.config?.url?.includes('/auth/')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthLoginResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, name?: string) =>
    api.post<AuthRegisterResponse>('/auth/register', { email, password, name }),
};

// User API
export const userApi = {
  getProfile: () => api.get<{ success: boolean; data: { user: User } }>('/users/profile'),
};

// Search API (no auth required)
export const searchApi = {
  search: (params: { q: string; category?: string; minPrice?: number; maxPrice?: number }) =>
    api.get<SearchResponse>('/search', { params }),
};

// Alerts API (auth required)
export const alertsApi = {
  getAlerts: (params?: { status?: string; isActive?: boolean }) =>
    api.get<AlertsListResponse>('/alerts', { params }),
  createAlert: (productId: string, targetPrice: number) =>
    api.post<CreateAlertResponse>('/alerts', { productId, targetPrice }),
  deleteAlert: (id: string) => api.delete(`/alerts/${id}`),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
  emailNotifications?: boolean;
  updatedAt?: string;
}

export interface AuthLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthRegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Search & Products
export interface Price {
  store: string;
  price: number;
  currency: string;
  url: string;
  inStock: boolean;
  lastUpdated: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  imageUrl?: string;
  prices: Price[];
  specifications?: Record<string, string>;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: Product[];
  sources: { database: number; bestBuy: number };
}

export interface AlertsListResponse {
  success: boolean;
  count: number;
  data: Array<{
    id: string;
    productId: string;
    targetPrice: number;
    isActive: boolean;
    status: string;
    product?: { id: string; name: string; brand: string };
  }>;
}

export interface CreateAlertResponse {
  success: boolean;
  message: string;
  data: { alert: { id: string; productId: string; targetPrice: number } };
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiError;
    return data.message || data.error || 'Something went wrong';
  }
  return error instanceof Error ? error.message : 'Something went wrong';
}
