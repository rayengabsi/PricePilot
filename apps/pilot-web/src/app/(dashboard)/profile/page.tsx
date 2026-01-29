'use client';

import { useAuthStore } from '@/lib/auth-store';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Manage your account and email preferences.
      </p>
      <div className="mt-6 card max-w-xl space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
          <p className="mt-1 text-slate-900 dark:text-white">{user?.email ?? '—'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Name</label>
          <p className="mt-1 text-slate-900 dark:text-white">{user?.name ?? 'Not set'}</p>
        </div>
        <p className="text-sm text-slate-500">Profile update and email preferences (GET /api/users/profile) will be wired in the next iteration.</p>
      </div>
    </div>
  );
}
