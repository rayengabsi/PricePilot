'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search as SearchIcon, Star } from 'lucide-react';
import { searchApi, type Product, type SearchResponse } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api';
import {
  getSearchPreferences,
  setSearchPreferences,
  getFavoriteSearches,
  addFavoriteSearch,
  getFavoriteProductIds,
  toggleFavoriteProduct,
  type SearchPreferences,
  type SortOption,
} from '@/lib/search-preferences';
import { CreateAlertModal } from '@/components/search/CreateAlertModal';
import { SearchFiltersSidebar, FilterTrigger } from '@/components/search/SearchFiltersSidebar';
import { SortDropdown } from '@/components/search/SortDropdown';
import { ProductCardEnhanced } from '@/components/search/ProductCardEnhanced';
import { CompareBar } from '@/components/search/CompareBar';
import { CompareModal } from '@/components/search/CompareModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';

const DEBOUNCE_MS = 300;
const MAX_COMPARE = 3;

/** Stable display rating from product id (for filter/sort). */
function getDisplayRating(productId: string): number {
  let h = 0;
  for (let i = 0; i < productId.length; i++) h = (h << 5) - h + productId.charCodeAt(i);
  return 3 + (Math.abs(h) % 3);
}

type ResultItem = { product: Product; source: 'Database' | 'Best Buy' };

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [rawResults, setRawResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertProduct, setAlertProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [preferences, setPreferencesState] = useState<SearchPreferences>(() =>
    typeof window !== 'undefined' ? getSearchPreferences() : getSearchPreferences()
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [favoriteSearchesOpen, setFavoriteSearchesOpen] = useState(false);
  const [favoriteSearches, setFavoriteSearches] = useState<string[]>([]);

  // Hydrate preferences and favorites from localStorage (client)
  useEffect(() => {
    setPreferencesState(getSearchPreferences());
    setFavoriteIds(getFavoriteProductIds());
    setFavoriteSearches(getFavoriteSearches());
  }, []);

  const updatePreferences = useCallback((next: Partial<SearchPreferences>) => {
    setPreferencesState((prev) => {
      const merged = { ...prev, ...next };
      setSearchPreferences(merged);
      return merged;
    });
  }, []);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(
    async (q: string) => {
      if (!q) {
        setRawResults([]);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params: { q: string; category?: string; minPrice?: number; maxPrice?: number } = {
          q,
        };
        if (preferences.minPrice != null) params.minPrice = preferences.minPrice;
        if (preferences.maxPrice != null) params.maxPrice = preferences.maxPrice;
        if (preferences.categories.length === 1) params.category = preferences.categories[0];
        const res = await searchApi.search(params);
        const data = res.data as SearchResponse;
        const databaseCount = data.sources.database;
        const items: ResultItem[] = data.data.map((product, index) => ({
          product,
          source: index < databaseCount ? 'Database' : 'Best Buy',
        }));
        setRawResults(items);
        addFavoriteSearch(q);
        setFavoriteSearches(getFavoriteSearches());
      } catch (err) {
        setError(getApiErrorMessage(err));
        setRawResults([]);
      } finally {
        setLoading(false);
      }
    },
    [preferences.minPrice, preferences.maxPrice, preferences.categories]
  );

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  // Client-side filter and sort
  const filteredAndSorted = useMemo(() => {
    let list = [...rawResults];
    const { minPrice, maxPrice, categories, store, ratingMin, sort } = preferences;

    // Price (already applied in API; re-apply for client consistency)
    list = list.filter(({ product }) => {
      const price = product.prices?.length
        ? Math.min(...product.prices.map((p) => p.price))
        : null;
      if (price == null) return false;
      if (minPrice != null && price < minPrice) return false;
      if (maxPrice != null && price > maxPrice) return false;
      return true;
    });

    // Category (multi)
    if (categories.length > 0) {
      const catSet = new Set(categories.map((c) => c.toLowerCase()));
      list = list.filter(({ product }) =>
        product.category && catSet.has(product.category.toLowerCase())
      );
    }

    // Store
    if (store === 'database') list = list.filter(({ source }) => source === 'Database');
    if (store === 'bestbuy') list = list.filter(({ source }) => source === 'Best Buy');

    // Rating
    if (ratingMin != null) {
      list = list.filter(({ product }) => getDisplayRating(product.id) >= ratingMin);
    }

    // Sort
    const sorted = [...list];
    const getPrice = (p: Product) =>
      p.prices?.length ? Math.min(...p.prices.map((x) => x.price)) : Infinity;
    if (sort === 'price_asc') {
      sorted.sort((a, b) => getPrice(a.product) - getPrice(b.product));
    } else if (sort === 'price_desc') {
      sorted.sort((a, b) => getPrice(b.product) - getPrice(a.product));
    } else if (sort === 'rating') {
      sorted.sort(
        (a, b) => getDisplayRating(b.product.id) - getDisplayRating(a.product.id)
      );
    } else if (sort === 'newest') {
      sorted.reverse();
    }
    return sorted;
  }, [rawResults, preferences]);

  const lowestPriceInList = useMemo(() => {
    if (filteredAndSorted.length === 0) return null;
    return Math.min(
      ...filteredAndSorted
        .map(({ product }) =>
          product.prices?.length ? Math.min(...product.prices.map((p) => p.price)) : Infinity
        )
        .filter((n) => n !== Infinity)
    );
  }, [filteredAndSorted]);

  const productsForCompare = useMemo(
    () =>
      compareIds
        .map((id) => filteredAndSorted.find(({ product }) => product.id === id)?.product)
        .filter(Boolean) as Product[],
    [compareIds, filteredAndSorted]
  );

  const availableCategories = useMemo(
    () =>
      Array.from(
        new Set(
          rawResults
            .map(({ product }) => product.category)
            .filter(Boolean) as string[]
        )
      ),
    [rawResults]
  );

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (preferences.minPrice != null || preferences.maxPrice != null) n++;
    if (preferences.categories.length > 0) n++;
    if (preferences.store !== 'both') n++;
    if (preferences.ratingMin != null) n++;
    return n;
  }, [preferences]);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
  }

  function handleFavoriteToggle(productId: string) {
    toggleFavoriteProduct(productId);
    setFavoriteIds(getFavoriteProductIds());
  }

  function handleCompareToggle(productId: string) {
    setCompareIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, productId]
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <SearchFiltersSidebar
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        preferences={preferences}
        onPreferencesChange={updatePreferences}
        availableCategories={availableCategories}
      />

      <div className="min-w-0 flex-1">
        <h1 className="text-h1 text-neutral-900 dark:text-white">Search products</h1>
        <p className="mt-1 text-body text-neutral-600 dark:text-neutral-400">
          Search the catalog and Best Buy. Use filters and sort to find the best deals.
        </p>

        {/* Search input + favorite searches */}
        <div className="relative mt-6 max-w-xl">
          <label htmlFor="search-input" className="sr-only">
            Search products
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                aria-hidden
              />
              <input
                id="search-input"
                type="search"
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFavoriteSearches(getFavoriteSearches())}
                onBlur={() => setTimeout(() => setFavoriteSearchesOpen(false), 150)}
                className="input-field w-full pl-10"
                autoComplete="off"
                autoFocus
                aria-expanded={favoriteSearchesOpen}
                aria-controls="favorite-searches-list"
              />
              {favoriteSearches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFavoriteSearchesOpen((o) => !o)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  aria-label="Recent searches"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              {favoriteSearchesOpen && favoriteSearches.length > 0 && (
                <ul
                  id="favorite-searches-list"
                  role="listbox"
                  className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-elevated dark:border-neutral-700 dark:bg-neutral-900"
                >
                  {favoriteSearches.slice(0, 8).map((q) => (
                    <li key={q} role="option">
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(q);
                          setFavoriteSearchesOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-body-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <FilterTrigger onClick={() => setFiltersOpen(true)} activeCount={activeFilterCount} />
          </div>
        </div>

        {/* Toolbar: result count + sort */}
        {!loading && (rawResults.length > 0 || debouncedQuery) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-body-sm text-neutral-500 dark:text-neutral-400">
              {filteredAndSorted.length} result{filteredAndSorted.length !== 1 ? 's' : ''}
              {debouncedQuery && ` for "${debouncedQuery}"`}
            </p>
            <SortDropdown
              value={preferences.sort}
              onChange={(value) => updatePreferences({ sort: value as SortOption })}
            />
          </div>
        )}

        {loading && (
          <div className="mt-8 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && !loading && (
          <div
            className="mt-6 max-w-xl rounded-xl bg-danger-50 p-4 text-body-sm text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && debouncedQuery && filteredAndSorted.length === 0 && !error && (
          <p className="mt-8 text-neutral-500 dark:text-neutral-400">
            No products found for &quot;{debouncedQuery}&quot;. Try adjusting filters.
          </p>
        )}

        {!loading && filteredAndSorted.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAndSorted.map(({ product, source }, index) => {
              const lowest = product.prices?.length
                ? Math.min(...product.prices.map((p) => p.price))
                : null;
              const isBestValue =
                lowest != null && lowestPriceInList != null && lowest === lowestPriceInList;
              const isTrending = index < 2;
              return (
                <ProductCardEnhanced
                  key={product.id}
                  product={product}
                  source={source}
                  canCreateAlert={source === 'Database'}
                  onCreateAlert={() => setAlertProduct(product)}
                  isBestValue={isBestValue}
                  isTrending={isTrending}
                  isInCompare={compareIds.includes(product.id)}
                  onCompareToggle={() => handleCompareToggle(product.id)}
                  isFavorite={favoriteIds.includes(product.id)}
                  onFavoriteToggle={() => handleFavoriteToggle(product.id)}
                  compareCount={compareIds.length}
                  maxCompare={MAX_COMPARE}
                />
              );
            })}
          </div>
        )}
      </div>

      {alertProduct && (
        <CreateAlertModal
          product={alertProduct}
          onClose={() => setAlertProduct(null)}
          onSuccess={() =>
            showToast('success', 'Price alert created. We’ll notify you when the price drops.')
          }
          onError={(msg) => showToast('error', msg)}
        />
      )}

      <CompareBar
        selected={productsForCompare}
        onRemove={(id) => setCompareIds((p) => p.filter((i) => i !== id))}
        onCompare={() => setCompareModalOpen(true)}
        onClear={() => setCompareIds([])}
        maxCompare={MAX_COMPARE}
      />

      {compareModalOpen && productsForCompare.length >= 2 && (
        <CompareModal
          products={productsForCompare}
          onClose={() => setCompareModalOpen(false)}
        />
      )}

      <Toast
        type={toast?.type ?? 'success'}
        message={toast?.message ?? ''}
        visible={!!toast}
        onDismiss={() => setToast(null)}
        duration={4000}
      />
    </div>
  );
}
