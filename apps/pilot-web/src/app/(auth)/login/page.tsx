'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registeredMessage, setRegisteredMessage] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setRegisteredMessage('Account created. Please sign in.');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginForm) {
    setSubmitError(null);
    try {
      const res = await authApi.login(data.email, data.password);
      const { token, user } = res.data.data;
      setAuth(token, user);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="card">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Welcome back to PricePilot
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {registeredMessage && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400" role="status">
            {registeredMessage}
          </div>
        )}
        {submitError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400" role="alert">
            {submitError}
          </div>
        )}
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="link-pilot">
          Sign up
        </Link>
      </p>
    </div>
  );
}
