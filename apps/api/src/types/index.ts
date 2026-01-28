/**
 * Type definitions for PricePilot API
 */

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

export interface SearchQuery {
  q: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CompareRequest {
  productIds: string[];
}

export interface CompareResponse {
  products: Product[];
  comparison: {
    cheapest: {
      productId: string;
      store: string;
      price: number;
    };
    priceRange: {
      min: number;
      max: number;
    };
  };
}

// Best Buy API Types
export interface BestBuyApiResponse {
  products: BestBuyProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface BestBuyProduct {
  sku: number;
  name: string;
  salePrice: number;
  regularPrice?: number;
  url: string;
  image: string;
  categoryPath?: Array<{ id: string; name: string }>;
  shortDescription?: string;
  longDescription?: string;
  brand?: string;
  modelNumber?: string;
  inStoreAvailability?: boolean;
  onlineAvailability?: boolean;
}
