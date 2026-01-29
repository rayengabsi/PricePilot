'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchApi, type Product, type SearchResponse } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api';
import { CreateAlertModal } from '@/components/search/CreateAlertModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const DEBOUNCE_MS = 300;

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResponse['data']>([]);
  const [sources, setSources] = useState<SearchResponse['sources']>({ database: 0, bestBuy: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alertProduct, setAlertProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const runSearch = useCallback(async (q: string) => {
    if (!q) {
      setResults([]);
      setSources({ database: 0, bestBuy: 0 });
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await searchApi.search({ q });
      setResults(res.data.data);
      setSources(res.data.sources);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setResults([]);
      setSources({ database: 0, bestBuy: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  function isFromDatabase(index: number): boolean {
    return index < sources.database;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Search products</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        Search the catalog and Best Buy. Set a target price to get notified when it drops.
      </p>

      <div className="mt-6">
        <label htmlFor="search-input" className="sr-only">
          Search products
        </label>
        <input
          id="search-input"
          type="search"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field max-w-xl"
          autoFocus
        />
      </div>

      {loading && (
        <div className="mt-8 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && !loading && (
        <div className="mt-6 max-w-xl rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400" role="alert">
          {error}
        </div>
      )}

      {!loading && debouncedQuery && results.length === 0 && !error && (
        <p className="mt-8 text-slate-500 dark:text-slate-400">No products found for &quot;{debouncedQuery}&quot;.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
            {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{debouncedQuery}&quot;
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                source={isFromDatabase(index) ? 'Database' : 'Best Buy'}
                canCreateAlert={isFromDatabase(index)}
                onCreateAlert={() => setAlertProduct(product)}
              />
            ))}
          </div>
        </div>
      )}

      {alertProduct && (
        <CreateAlertModal
          product={alertProduct}
          onClose={() => setAlertProduct(null)}
          onSuccess={() => showToast('success', 'Price alert created. We’ll notify you when the price drops.')}
          onError={(msg) => showToast('error', msg)}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-lg px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  source: 'Database' | 'Best Buy';
  canCreateAlert: boolean;
  onCreateAlert: () => void;
}

function ProductCard({ product, source, canCreateAlert, onCreateAlert }: ProductCardProps) {
  const lowestPrice = product.prices?.length
    ? Math.min(...product.prices.map((p) => p.price))
    : null;
  const bestPrice = product.prices?.length
    ? product.prices.reduce((best, p) => (p.price < best.price ? p : best), product.prices[0])
    : null;

  return (
    <div className="card flex flex-col overflow-hidden transition hover:border-pilot-300 hover:shadow-pilot dark:hover:border-pilot-600">
      <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-700">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-400">📦</div>
        )}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
            source === 'Database'
              ? 'bg-pilot-100 text-pilot-800 dark:bg-pilot-900/50 dark:text-pilot-200'
              : 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200'
          }`}
        >
          {source}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-slate-900 dark:text-white" title={product.name}>
          {product.name}
        </h3>
        {product.brand && (
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{product.brand}</p>
        )}
        {lowestPrice != null && bestPrice && (
          <p className="mt-2 text-lg font-semibold text-pilot-600 dark:text-pilot-400">
            ${lowestPrice.toFixed(2)}
            <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
              at {bestPrice.store}
            </span>
          </p>
        )}
        <div className="mt-auto pt-4">
          {canCreateAlert ? (
            <button
              type="button"
              onClick={onCreateAlert}
              className="btn-primary w-full"
            >
              Create Alert
            </button>
          ) : (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Alert only for catalog products
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
