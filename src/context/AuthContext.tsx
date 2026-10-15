import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserProfile, AuthSession } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { pullApplications } from '../services/applicationSync';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  role: 'student' | 'admin' | null;
  isAdmin: boolean;
  isStudent: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    whatsapp?: string;
    nationality?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: 'student' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession>({ user: null, profile: null });
  const [loading, setLoading] = useState<boolean>(true);

  const syncSession = async () => {
    try {
      const active = await authService.getSession();
      setSession(active);
    } catch (e) {
      console.error('Session sync error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncSession();

    const handleLocalState = () => {
      syncSession();
    };
    window.addEventListener('chinastudy_auth_state_changed', handleLocalState);

    // Production: follow Supabase sign-in / sign-out (incl. email confirmation links) and load data
    let unsubscribe: (() => void) | undefined;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          // Defer: Supabase recommends not calling its API inside this callback directly
          setTimeout(() => {
            syncSession();
            void pullApplications();
          }, 0);
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    }

    return () => {
      window.removeEventListener('chinastudy_auth_state_changed', handleLocalState);
      unsubscribe?.();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await authService.login(email, password);
    setLoading(false);
    if (res.error) return { success: false, error: res.error };
    setSession({ user: res.user, profile: res.profile });
    return { success: true };
  };

  const register = async (params: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    whatsapp?: string;
    nationality?: string;
  }) => {
    setLoading(true);
    const res = await authService.register(params);
    setLoading(false);
    if (res.error) return { success: false, error: res.error };
    setSession({ user: res.user, profile: res.profile });
    return { success: true };
  };

  const loginAsDemo = async (role: 'student' | 'admin') => {
    setLoading(true);
    const res = await authService.loginAsDemo(role);
    setSession(res);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await authService.logout();
    setSession({ user: null, profile: null });
    setLoading(false);
  };

  const forgotPassword = async (email: string) => {
    return authService.forgotPassword(email);
  };

  const value: AuthContextType = {
    user: session.user,
    profile: session.profile,
    role: session.profile?.role || null,
    isAdmin: session.profile?.role === 'admin',
    isStudent: session.profile?.role === 'student',
    isAuthenticated: Boolean(session.user),
    loading,
    login,
    register,
    loginAsDemo,
    logout,
    forgotPassword,
    refreshSession: syncSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
