import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetUserPassword: (userId: string) => Promise<void>;
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
    branchIds: ['1'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ... (other mock users)
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
        u => u.email === email && u.password === password
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

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('crm-user');
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    const mockUser = MOCK_USERS.find(u => u.id === user.id);
    if (!mockUser || mockUser.password !== currentPassword) {
      throw new Error('Current password is incorrect');
    }

    mockUser.password = newPassword;
  };

  const resetUserPassword = async (userId: string): Promise<void> => {
    if (!user || user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }

    const targetUser = MOCK_USERS.find(u => u.id === userId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    targetUser.password = `${targetUser.role.toLowerCase()}123`;
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    changePassword,
    resetUserPassword,
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