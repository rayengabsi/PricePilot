'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type SearchPreferences,
  type StoreFilter,
  STORE_OPTIONS,
  RATING_OPTIONS,
} from '@/lib/search-preferences';

const PRICE_MIN = 0;
const PRICE_MAX = 5000;
const STEP = 10;

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Computers',
  'Home',
  'Appliances',
  'Gaming',
  'TV',
  'Phones',
  'Cameras',
  'Other',
];

interface SearchFiltersSidebarProps {
  open: boolean;
  onClose: () => void;
  preferences: SearchPreferences;
  onPreferencesChange: (prefs: Partial<SearchPreferences>) => void;
  availableCategories: string[];
}

export function SearchFiltersSidebar({
  open,
  onClose,
  preferences,
  onPreferencesChange,
  availableCategories,
}: SearchFiltersSidebarProps) {
  const [localMin, setLocalMin] = useState<string>(
    preferences.minPrice != null ? String(preferences.minPrice) : ''
  );
  const [localMax, setLocalMax] = useState<string>(
    preferences.maxPrice != null ? String(preferences.maxPrice) : ''
  );

  useEffect(() => {
    setLocalMin(preferences.minPrice != null ? String(preferences.minPrice) : '');
    setLocalMax(preferences.maxPrice != null ? String(preferences.maxPrice) : '');
  }, [preferences.minPrice, preferences.maxPrice]);

  const categories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...availableCategories])
  ).sort();

  const minVal = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(localMin) || PRICE_MIN));
  const maxVal = Math.max(PRICE_MIN, Math.min(PRICE_MAX, Number(localMax) || PRICE_MAX));

  const applyPrice = () => {
    onPreferencesChange({
      minPrice: localMin === '' ? null : Number(localMin) || null,
      maxPrice: localMax === '' ? null : Number(localMax) || null,
    });
  };

  const toggleCategory = (cat: string) => {
    const next = preferences.categories.includes(cat)
      ? preferences.categories.filter((c) => c !== cat)
      : [...preferences.categories, cat];
    onPreferencesChange({ categories: next });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-[min(320px,85vw)] border-r border-neutral-200 bg-white shadow-elevated transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-900 lg:static lg:z-0 lg:h-auto lg:w-64 lg:shrink-0 lg:border-r lg:rounded-2xl lg:border lg:p-4 lg:shadow-card',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Search filters"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-700 lg:border-0 lg:p-0 lg:pb-4">
          <h2 className="text-h4 text-neutral-900 dark:text-white">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 lg:hidden"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto p-4 lg:max-h-none lg:p-0 lg:pt-4">
          {/* Price range */}
          <section className="mb-6">
            <h3 className="mb-3 text-body-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Price range
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={STEP}
                  placeholder="Min"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  onBlur={applyPrice}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-body-sm text-neutral-900 placeholder-neutral-400 focus:border-pilot-500 focus:outline-none focus:ring-1 focus:ring-pilot-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
                <input
                  type="number"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={STEP}
                  placeholder="Max"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  onBlur={applyPrice}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-body-sm text-neutral-900 placeholder-neutral-400 focus:border-pilot-500 focus:outline-none focus:ring-1 focus:ring-pilot-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-body-sm text-neutral-500 dark:text-neutral-400">
                  <span>Min: {localMin || '—'}</span>
                  <span>Max: {localMax || '—'}</span>
                </div>
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={STEP}
                  value={minVal}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLocalMin(String(v));
                    if (v > maxVal) setLocalMax(String(v));
                  }}
                  onMouseUp={applyPrice}
                  onTouchEnd={applyPrice}
                  className="h-2 w-full accent-pilot-600"
                  aria-label="Minimum price"
                />
                <input
                  type="range"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={STEP}
                  value={maxVal}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setLocalMax(String(v));
                    if (minVal > v) setLocalMin(String(v));
                  }}
                  onMouseUp={applyPrice}
                  onTouchEnd={applyPrice}
                  className="h-2 w-full accent-pilot-600"
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </section>

          {/* Store */}
          <section className="mb-6">
            <h3 className="mb-3 text-body-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Store
            </h3>
            <div className="flex flex-wrap gap-2">
              {STORE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onPreferencesChange({ store: opt.value as StoreFilter })}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-body-sm font-medium transition',
                    preferences.store === opt.value
                      ? 'border-pilot-500 bg-pilot-100 text-pilot-700 dark:bg-pilot-900/50 dark:text-pilot-300'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          {/* Category */}
          <section className="mb-6">
            <h3 className="mb-3 text-body-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Category
            </h3>
            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-body-sm font-medium transition',
                    preferences.categories.includes(cat)
                      ? 'border-pilot-500 bg-pilot-100 text-pilot-700 dark:bg-pilot-900/50 dark:text-pilot-300'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Rating */}
          <section>
            <h3 className="mb-3 text-body-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Rating
            </h3>
            <div className="flex flex-wrap gap-2">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value ?? 'any'}
                  type="button"
                  onClick={() => onPreferencesChange({ ratingMin: opt.value })}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-body-sm font-medium transition',
                    preferences.ratingMin === opt.value
                      ? 'border-pilot-500 bg-pilot-100 text-pilot-700 dark:bg-pilot-900/50 dark:text-pilot-300'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

interface FilterTriggerProps {
  onClick: () => void;
  activeCount: number;
}

export function FilterTrigger({ onClick, activeCount }: FilterTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-body-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 lg:hidden"
      aria-label="Open filters"
    >
      <SlidersHorizontal className="h-4 w-4" />
      Filters
      {activeCount > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pilot-100 px-1.5 text-xs font-semibold text-pilot-700 dark:bg-pilot-900 dark:text-pilot-300">
          {activeCount}
        </span>
      )}
    </button>
  );
}
