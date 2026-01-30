'use client';

import Link from 'next/link';

const actions = [
  {
    href: '/search',
    label: 'Create new alert',
    icon: '➕',
    desc: 'Search and set a target price',
  },
  {
    href: '/alerts',
    label: 'View all alerts',
    icon: '🔔',
    desc: 'Manage your price alerts',
  },
  {
    href: '/search',
    label: 'Browse products',
    icon: '🔍',
    desc: 'Explore and compare prices',
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className="card flex items-center gap-4 transition hover:border-pilot-400 hover:shadow-pilot dark:hover:border-pilot-500"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-pilot-100 text-xl dark:bg-pilot-900/50">
            {a.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 dark:text-white">{a.label}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{a.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
