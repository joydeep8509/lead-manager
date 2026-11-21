'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ApiError } from '@/lib/api';
import { validateAuthForm } from '@/lib/validation';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationErrors = validateAuthForm(
      { name, email, password },
      'register'
    );
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      router.replace('/');
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : 'Unable to create account. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-[#0b0d0e]">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-zinc-800 dark:bg-[#14171a] dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-zinc-800/90 dark:bg-[#14171a]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#65c146] text-zinc-950 shadow-sm">
            <Users className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Create your account
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Start tracking sales leads in seconds
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {serverError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {serverError}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Alex Rivera"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#65c146] focus:outline-none focus:ring-2 focus:ring-[#65c146]/20 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              placeholder="alex@company.com"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#65c146] focus:outline-none focus:ring-2 focus:ring-[#65c146]/20 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-zinc-400"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: '' }));
              }}
              placeholder="At least 8 characters"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#65c146] focus:outline-none focus:ring-2 focus:ring-[#65c146]/20 dark:border-zinc-800 dark:bg-[#1a1d21] dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-[#65c146] px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-md shadow-[#65c146]/20 transition hover:bg-[#54ad36] disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#65c146] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
