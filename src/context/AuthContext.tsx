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

  useEffect(() => {
    const initAuth = async () => {
      if (!supabase) {
        console.error('❌ Supabase não configurado! Configure as variáveis de ambiente.');
        setError('Sistema não configurado. Entre em contato com o administrador.');
        setLoading(false);
        return;
      }
      
      try {
        console.log('🔄 Verificando sessão Supabase...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('✅ Sessão encontrada, carregando perfil...');
          
          // Get user profile from Supabase
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
            
          if (profileError) {
            console.error('❌ Erro ao carregar perfil:', profileError);
            setError('Erro ao carregar perfil do usuário');
            setLoading(false);
            return;
          }
          
          if (profile) {
            const userData = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              status: profile.status,
              branchIds: profile.branch_ids || [],
              avatar: profile.avatar,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at)
            };
            
            setUser(userData);
          }
        } else {
          console.log('📱 Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        setError('Erro ao conectar com o servidor');
      }
      
      setLoading(false);
    };
    
    initAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in, get profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
            
          if (profile) {
            const userData = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              status: profile.status,
              branchIds: profile.branch_ids || [],
              avatar: profile.avatar,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at)
            };
            
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    if (!supabase) {
      setError('Sistema não configurado. Entre em contato com o administrador.');
      setLoading(false);
      throw new Error('Supabase não configurado');
    }
    
    try {
      console.log('🔍 Tentando login para:', email);
      
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.log('❌ Erro Supabase auth:', error.message);
        throw new Error('Email ou senha inválidos');
      }
      
      if (data.user) {
        console.log('✅ Usuário autenticado no Supabase');
        
        // Get user profile from public.users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
          
        if (profileError) {
          console.log('❌ Erro ao buscar perfil:', profileError.message);
          throw new Error('Erro ao carregar perfil do usuário');
        }
        
        if (profile) {
          const userData = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            role: profile.role,
            status: profile.status,
            branchIds: profile.branch_ids || [],
            avatar: profile.avatar,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at)
          };
          
          setUser(userData);
          console.log('✅ Login realizado com sucesso');
        }
      }
      
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    if (supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user || !supabase) {
      throw new Error('Usuário não logado ou sistema não configurado');
    }

    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update password in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ pass: newPassword })
        .eq('id', user.id);
      
      if (updateError) {
        throw new Error('Erro ao atualizar senha no banco de dados');
      }
      
      console.log('✅ Senha atualizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar senha:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    if (!supabase) {
      throw new Error('Sistema não configurado');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Iniciando reset de senha para:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.log('❌ Erro no reset:', error.message);
        throw new Error('Erro ao enviar email de reset. Verifique se o email está correto.');
      }
      
      console.log('✅ Email de reset enviado via Supabase');
      alert('Email de reset de senha enviado! Verifique sua caixa de entrada.');
      
    } catch (err) {
      console.error('❌ Erro no reset de senha:', err);
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
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