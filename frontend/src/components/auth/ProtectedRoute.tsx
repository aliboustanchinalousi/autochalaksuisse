'use client';
import React, { ReactNode, useEffect } from 'react'; // Added useEffect for potential side-effects on redirect
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n.client';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, token } = useAuth(); // Added token to check its presence explicitly
  const router = useRouter();
  const pathname = usePathname();
  const locale = useCurrentLocale();

  useEffect(() => {
    // This effect handles the redirection logic after isLoading has resolved.
    // It also ensures that if isAuthenticated becomes false after initial load (e.g. token revoked),
    // the user is redirected.
    if (!isLoading && !isAuthenticated) {
      console.log('ProtectedRoute: Not authenticated, redirecting to login.');
      const callbackUrl = pathname;
      router.push(`/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname, locale]);


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 dark:border-blue-400 mb-4"></div>
        <p className="text-lg">Loading authentication status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // While useEffect handles redirection, returning null (or a minimal message) prevents rendering children.
    // This is important because redirection might not be instantaneous.
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
            <p className="text-lg">Redirecting to login...</p>
        </div>
    );
  }

  // If authenticated and not loading, render the children.
  return <>{children}</>;
};

export default ProtectedRoute;
