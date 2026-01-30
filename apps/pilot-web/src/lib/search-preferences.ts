/**
 * Search filters & sort preferences persisted in localStorage.
 */

const STORAGE_KEY = 'pricepilot_search_preferences';
const FAVORITES_KEY = 'pricepilot_favorite_searches';
const FAVORITE_PRODUCTS_KEY = 'pricepilot_favorite_products';
const MAX_FAVORITES = 10;

export type StoreFilter = 'both' | 'database' | 'bestbuy';
export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'rating';

export interface SearchPreferences {
  minPrice: number | null;
  maxPrice: number | null;
  categories: string[];
  store: StoreFilter;
  ratingMin: number | null; // 3, 4, or 5 for "3+", "4+", "5"
  sort: SortOption;
}

const defaults: SearchPreferences = {
  minPrice: null,
  maxPrice: null,
  categories: [],
  store: 'both',
  ratingMin: null,
  sort: 'relevance',
};

export function getSearchPreferences(): SearchPreferences {
  if (typeof window === 'undefined') return { ...defaults };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<SearchPreferences>;
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

export function setSearchPreferences(prefs: Partial<SearchPreferences>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getSearchPreferences();
    const next = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function getFavoriteSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addFavoriteSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  const trimmed = query.trim();
  const current = getFavoriteSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...current].slice(0, MAX_FAVORITES);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function removeFavoriteSearch(query: string): void {
  if (typeof window === 'undefined') return;
  const current = getFavoriteSearches().filter(
    (q) => q.toLowerCase() !== query.toLowerCase()
  );
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function getFavoriteProductIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITE_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteProduct(productId: string): void {
  if (typeof window === 'undefined') return;
  const current = getFavoriteProductIds();
  const has = current.includes(productId);
  const next = has ? current.filter((id) => id !== productId) : [...current, productId];
  try {
    localStorage.setItem(FAVORITE_PRODUCTS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Rating' },
];

export const STORE_OPTIONS: { value: StoreFilter; label: string }[] = [
  { value: 'both', label: 'Both' },
  { value: 'database', label: 'Database' },
  { value: 'bestbuy', label: 'Best Buy' },
];

export const RATING_OPTIONS = [
  { value: null, label: 'Any' },
  { value: 3, label: '3+ stars' },
  { value: 4, label: '4+ stars' },
  { value: 5, label: '5 stars' },
];
