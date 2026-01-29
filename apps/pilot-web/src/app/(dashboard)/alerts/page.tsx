'use client';

export default function AlertsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Price alerts</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        View and manage your price alerts. Create alerts from search results.
      </p>
      <div className="mt-6 card max-w-xl">
        <p className="text-sm text-slate-500">Your alerts will appear here. (Alerts API: GET /api/alerts)</p>
      </div>
    </div>
  );
}
