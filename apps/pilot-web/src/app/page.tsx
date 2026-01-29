import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <div className="rounded-2xl bg-gradient-to-br from-pilot-500 via-pilot-600 to-sky-600 p-1 shadow-pilot-lg">
        <div className="rounded-xl bg-white/95 px-6 py-16 dark:bg-slate-900/95 sm:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            <span className="text-pilot-600 dark:text-pilot-400">PricePilot</span>
            <br />
            Never overpay again
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">
            AI-powered price comparison. Search products, set price alerts, and get notified when prices drop.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-lg bg-pilot-600 px-6 py-3 text-base font-medium text-white shadow-pilot hover:bg-pilot-700 sm:w-auto"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="w-full rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:w-auto"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        <div className="card text-left">
          <div className="mb-3 text-2xl">🔍</div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Search & Compare</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Real-time product search across stores. Filter by category and price.
          </p>
        </div>
        <div className="card text-left">
          <div className="mb-3 text-2xl">🔔</div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Price Alerts</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Set target prices and get notified when they drop. Never miss a deal.
          </p>
        </div>
        <div className="card text-left">
          <div className="mb-3 text-2xl">📊</div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Dashboard</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Overview of your alerts and triggered prices in one place.
          </p>
        </div>
      </section>
    </div>
  );
}
