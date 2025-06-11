'use client';
import React, { useState, FormEvent } from 'react'; // Explicitly import FormEvent
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n, useCurrentLocale } from '@/lib/i18n.client';

export default function RegisterPage() {
  const { register, isRegistering, authError, clearAuthError } = useAuth(); // Using isRegistering
  const router = useRouter();
  const locale = useCurrentLocale();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  // const [formError, setFormError] = useState<string | null>(null); // Use authError from context
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => { // Typed event
    e.preventDefault();
    // setFormError(null);
    clearAuthError();
    setRegistrationSuccess(false);

    if (password !== confirmPassword) {
      // setFormError(t('passwords_do_not_match') || "Passwords do not match.");
      // For this case, local form error or direct use of authError is fine.
      // Let's use the authError from context by throwing, or set it.
      // This is a client-side validation, so not strictly an "authError" from API.
      // For simplicity, let's use a local error for this specific validation.
      alert(t('passwords_do_not_match') || "Passwords do not match."); // Simple alert for now
      return;
    }
    if (password.length < 6) {
      alert(t('password_too_short_6_chars') || "Password must be at least 6 characters long.");
      return;
    }


    try {
      await register({ email, password, full_name: fullName });
      setRegistrationSuccess(true);
    } catch (error: any) {
      // authError will be set by the register function in context
      // setFormError(error.message || 'Registration failed.');
      console.error("Register page caught error:", error.message);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('registration_successful_title') || 'Registration Successful!'}</h1>
          <p className="text-gray-700 dark:text-gray-300">{t('registration_successful_message') || 'You can now proceed to login.'}</p>
          <Link href={`/${locale}/login`} className="inline-block mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm">
            {t('proceed_to_login') || 'Proceed to Login'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('register_title') || 'Create an account'}
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
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('full_name') || 'Full Name'} <span className="text-xs text-gray-500 dark:text-gray-400">({t('optional') || 'Optional'})</span>
            </label>
            <input id="fullName" name="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                   className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white"/>
          </div>
          <div>
            <label htmlFor="email-register" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('email') || 'Email address'}
            </label>
            <input id="email-register" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                   className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white"/>
          </div>
          <div>
            <label htmlFor="password-register" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('password') || 'Password'}
            </label>
            <input id="password-register" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                   className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white"/>
          </div>
           <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('confirm_password') || 'Confirm Password'}
            </label>
            <input id="confirm-password" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                   className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm dark:bg-gray-700 dark:text-white"/>
          </div>
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-500"
          >
            {isRegistering ? (t('loading') || 'Loading...') : (t('register_button') || 'Create account')}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('already_have_account') || 'Already have an account?'}{' '}
          <Link href={`/${locale}/login`} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            {t('login_link') || 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
