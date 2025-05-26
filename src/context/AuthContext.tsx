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

// Mock users with passwords (in a real app, passwords would be hashed)
const MOCK_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '+5511999999999',
    role: UserRole.ADMIN,
    status: 'ACTIVE',
    branchId: '1',
    branchIds: ['1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Director User',
    email: 'director@example.com',
    password: 'director123',
    phone: '+5511888888888',
    role: UserRole.DIRECTOR,
    status: 'ACTIVE',
    branchId: '1',
    branchIds: ['1', '2'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'manager123',
    phone: '+5511777777777',
    role: UserRole.MANAGER,
    status: 'ACTIVE',
    branchId: '1',
    branchIds: ['1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Jonny Santos',
    email: 'jonny@brestelecom.com.br',
    password: 'vendas123',
    phone: '+5511666666666',
    role: UserRole.SALESPERSON,
    status: 'ACTIVE',
    branchId: '1',
    branchIds: ['1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Alex Support',
    email: 'suporte@brestelecom.com.br',
    password: 'suporte123',
    phone: '+5511555555555',
    role: UserRole.ASSISTANT,
    status: 'ACTIVE',
    branchId: '1',
    branchIds: ['1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Rafael Sales',
    email: 'contato@brestelecom.com.br',
    password: 'vendas123',
    phone: '+5511444444444',
    role: UserRole.SALESPERSON,
    status: 'ACTIVE',
    branchId: '1',
    branchIds: ['1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('crm-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to parse saved user', err);
        localStorage.removeItem('crm-user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundUser = MOCK_USERS.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      localStorage.setItem('crm-user', JSON.stringify(userWithoutPassword));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const foundUser = MOCK_USERS.find(u => u.email === user.email);
    if (!foundUser || foundUser.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // In a real app, this would make an API call to update the password
    foundUser.password = newPassword;
    return Promise.resolve();
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('crm-user');
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