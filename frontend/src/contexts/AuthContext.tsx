'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '@/types/auth';
import { registerUser as apiRegister, loginUser as apiLogin } from '@/services/authService';
import { useRouter } from 'next/navigation'; // Corrected: use from 'next/navigation' for App Router
import { useCurrentLocale } from '@/lib/i18n.client';


interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // For initial load and during auth operations
  isLoggingIn: boolean; // Specific loading state for login
  isRegistering: boolean; // Specific loading state for registration
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial localStorage check
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const currentLocale = useCurrentLocale();

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUserString = localStorage.getItem('authUser');
      if (storedToken && storedUserString) {
        setToken(storedToken);
        setUser(JSON.parse(storedUserString));
      }
    } catch (error) {
      // Problem parsing localStorage, clear potentially corrupted data
      console.error("Error loading auth data from localStorage:", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const { token: newToken, user: loggedInUser } = await apiLogin(credentials);
      setToken(newToken);
      setUser(loggedInUser);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(loggedInUser));
    } catch (error: any) {
      setAuthError(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  }, []); // No dependencies needed if router/locale not used inside

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsRegistering(true);
    setAuthError(null);
    try {
      await apiRegister(credentials);
    } catch (error: any) {
      setAuthError(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsRegistering(false);
    }
  }, []); // No dependencies needed

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    // Redirect to home or login page.
    // Using a timeout to ensure state update is processed before navigation,
    // though usually Next.js handles this well.
    setTimeout(() => router.push(`/${currentLocale}`), 0);
  }, [router, currentLocale]);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated: !!token,
      isLoading, isLoggingIn, isRegistering,
      login, logout, register,
      authError, clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
