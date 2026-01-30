'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Search, Bell, User } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { useAlertCountStore } from '@/lib/alert-count-store';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { token, user } = useAuthStore();
  const { count } = useAlertCountStore();
  const isAuth = !!token && !!user;

  if (!isAuth) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-neutral-200 bg-white/95 px-2 pb-safe pt-2 backdrop-blur supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] dark:border-neutral-800 dark:bg-neutral-900/95 lg:hidden"
      aria-label="Primary"
    >
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        const isAlerts = href === '/alerts';
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'relative flex min-w-[64px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-caption font-medium transition',
              active
                ? 'text-pilot-600 dark:text-pilot-400'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <span className="relative inline-flex">
              <Icon className="h-6 w-6" aria-hidden="true" />
              {isAlerts && count > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-pilot-600 px-1 text-[10px] font-semibold text-white">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
