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
