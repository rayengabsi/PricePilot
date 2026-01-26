// ============================================
// PricePilot Shared Types
// Centralized type definitions for all applications
// ============================================

// Core Entities
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  store: string;
  storeUrl: string;
  imageUrl: string;
  category: string;
  brand?: string;
  
  // AI/ML fields
  embedding?: number[]; // For semantic search
  relevanceScore?: number;
  
  // Ratings & Reviews
  rating?: number;
  reviewCount?: number;
  features?: string[];
  
  // Metadata
  sku?: string;
  availability: "in-stock" | "out-of-stock" | "pre-order";
  lastUpdated: Date;
  createdAt: Date;
}

export interface PricePoint {
  price: number;
  date: Date;
  store: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "customer" | "business" | "admin";
  
  // Preferences
  preferredStores?: string[];
  priceAlertsEnabled: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  categories?: string[];
  stores?: string[];
  ratingMin?: number;
  availability?: "in-stock" | "all";
  sortBy?: "price-asc" | "price-desc" | "rating" | "relevance";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}
