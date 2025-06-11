'use client';
import React, { useState, FormEvent } from 'react'; // Explicitly import FormEvent
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n, useCurrentLocale } from '@/lib/i18n.client';

export default function LoginPage() {
  const { login, isLoggingIn, authError, clearAuthError } = useAuth(); // Using isLoggingIn
  const router = useRouter();
  const locale = useCurrentLocale();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Using authError from context directly is often better than local formError for auth issues
  // const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => { // Typed event
    e.preventDefault();
    // setFormError(null);
    clearAuthError(); // Clear previous context errors before new attempt
    try {
      await login({ email, password });
      // Redirect on success. Check if a redirect path was passed in query params, else default.
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
      router.push(callbackUrl || `/${locale}`);
    } catch (error: any) {
      // authError from context will be set by the login function itself
      // setFormError(error.message || 'Login failed.'); // No need if authError is used from context
      console.error("Login page caught error:", error.message); // Keep for debugging
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('login_title') || 'Sign in to your account'}
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 shadow-xl rounded-lg">
          {authError && (
            <div className="bg-red-100 dark:bg-red-700 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 px-4 py-3 rounded relative text-sm" role="alert">
              <strong className="font-bold">{t('error_occurred') || 'Error:'} </strong>
              <span className="block sm:inline">{authError}</span>
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('email') || 'Email address'}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('password') || 'Password'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-500"
          >
            {isLoggingIn ? (t('loading') || 'Loading...') : (t('login_button') || 'Sign in')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('dont_have_account') || "Don't have an account?"}{' '}
          <Link href={`/${locale}/register`} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            {t('register_link') || 'Register here'}
          </Link>
        </p>
      </div>
    </div>
  );
}
