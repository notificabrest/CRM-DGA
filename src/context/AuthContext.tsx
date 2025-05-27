import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // First check if user exists and password matches
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('password', password)
        .single();

      if (userError || !userData) {
        throw new Error('Invalid email or password');
      }

      // If successful, set the user
      setUser(userData as User);
      
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      // First verify current password
      const { data: userData, error: verifyError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('password', currentPassword)
        .single();

      if (verifyError || !userData) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }
    } catch (err) {
      throw new Error((err as Error).message);
    }
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};