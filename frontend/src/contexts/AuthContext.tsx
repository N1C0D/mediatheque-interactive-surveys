'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthState } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  });

  const refreshUser = useCallback(async () => {
    try {
      const user = await api.getCurrentUser();
      if (user) {
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          isAdmin: user.roles?.includes('ROLE_ADMIN') ?? false,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isAdmin: false,
        });
      }
    } catch {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isAdmin: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const { user } = await api.login(email, password);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        isAdmin: user.roles?.includes('ROLE_ADMIN') ?? false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    await api.logout();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    });
  };

  const register = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await api.register({ email, password });
      await login(email, password);
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
