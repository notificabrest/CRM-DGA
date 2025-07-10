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
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get users from localStorage (same source as DataContext)
  const getUsers = () => {
    try {
      const savedData = localStorage.getItem('crm-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData.users || [];
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    return [];
  };

  // Update user in localStorage
  const updateUserInStorage = (updatedUser: User) => {
    try {
      const savedData = localStorage.getItem('crm-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const users = parsedData.users || [];
        const userIndex = users.findIndex((u: User) => u.id === updatedUser.id);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          parsedData.users = users;
          localStorage.setItem('crm-data', JSON.stringify(parsedData));
        }
      }
    } catch (error) {
      console.error('Error updating user in storage:', error);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('crm-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Verify user still exists in the system
        const users = getUsers();
        const currentUser = users.find((u: User) => u.id === parsedUser.id);
        if (currentUser) {
          setUser(currentUser);
        } else {
          localStorage.removeItem('crm-user');
        }
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
      
      const users = getUsers();
      console.log('🔍 Tentando login para:', email);
      console.log('👥 Usuários disponíveis:', users.map((u: User) => ({ email: u.email, password: u.password })));
      
      const foundUser = users.find((u: User) => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (!foundUser) {
        console.log('❌ Usuário não encontrado ou senha incorreta');
        throw new Error('Email ou senha inválidos');
      }
      
      console.log('✅ Login bem-sucedido para:', foundUser.name);
      
      // Remove password from user object before storing
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
      throw new Error('Nenhum usuário logado');
    }

    const users = getUsers();
    const foundUser = users.find((u: User) => u.email === user.email);
    if (!foundUser || foundUser.password !== currentPassword) {
      throw new Error('Senha atual está incorreta');
    }

    // Update password in the user object
    const updatedUser = { ...foundUser, password: newPassword };
    updateUserInStorage(updatedUser);
    
    return Promise.resolve();
  };

  const resetPassword = async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const users = getUsers();
      const foundUser = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('Email não encontrado no sistema');
      }

      // Reset password to default
      const defaultPassword = `${foundUser.role.toLowerCase()}123`;
      const updatedUser = { ...foundUser, password: defaultPassword };
      updateUserInStorage(updatedUser);

      // Send reset email (simulate)
      console.log(`📧 Enviando email de reset de senha para: ${email}`);
      console.log(`🔑 Nova senha: ${defaultPassword}`);
      
      // In a real application, you would send an email here
      alert(`Senha resetada com sucesso! Nova senha: ${defaultPassword}\n\nEm um sistema real, esta informação seria enviada por email.`);
      
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

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    hasPermission,
    updatePassword,
    resetPassword,
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