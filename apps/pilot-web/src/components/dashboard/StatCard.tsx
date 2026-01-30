'use client';

import Link from 'next/link';


interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  href?: string;
  icon: string;
  accent?: 'pilot' | 'green' | 'sky' | 'amber';
}

const accentStyles = {
  pilot: 'border-pilot-200 bg-pilot-50/50 dark:border-pilot-800 dark:bg-pilot-900/20',
  green: 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20',
  sky: 'border-sky-200 bg-sky-50/50 dark:border-sky-800 dark:bg-sky-900/20',
  amber: 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20',
};

const iconBg = {
  pilot: 'bg-pilot-100 text-pilot-600 dark:bg-pilot-900/50 dark:text-pilot-400',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
};

export function StatCard({ title, value, sub, href, icon, accent = 'pilot' }: StatCardProps) {
  const base = 'card flex flex-col gap-3 transition hover:border-pilot-300 hover:shadow-pilot dark:hover:border-pilot-600';
  const border = accentStyles[accent];
  const content = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${iconBg[accent]}`}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      {sub != null && <p className="text-sm text-slate-500 dark:text-slate-400">{sub}</p>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`block ${base} ${border}`}>
        {content}
      </Link>
    );
  }
  return (
    <div className={`${base} ${border}`}>
      {content}
    </div>
  );
}
