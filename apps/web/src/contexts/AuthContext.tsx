'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requiresMfa?: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        setUser(null);
        return;
      }

      // Demo mode: get user from localStorage
      const demoUser = localStorage.getItem('demo_user');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        return;
      }

      // No user found
      setUser(null);
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    } catch {
      setUser(null);
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      // Demo mode: check localStorage for user
      const demoUsers = JSON.parse(localStorage.getItem('demo_users') || '{}');
      const storedUser = demoUsers[email];

      if (!storedUser) {
        return { success: false, error: 'No account found with this email. Please register first.' };
      }

      if (storedUser.password !== password) {
        return { success: false, error: 'Invalid password. Please try again.' };
      }

      // Login successful
      const { password: _, ...userWithoutPassword } = storedUser;
      localStorage.setItem('demo_user', JSON.stringify(userWithoutPassword));

      Cookies.set('access_token', 'demo_token_' + storedUser.id, { sameSite: 'lax' });
      Cookies.set('refresh_token', 'demo_refresh_' + storedUser.id, { sameSite: 'lax' });

      setUser(userWithoutPassword);
      return { success: true };
    } catch {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('demo_user');
    } finally {
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
