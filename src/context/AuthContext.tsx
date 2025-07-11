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
  const [useSupabaseAuth, setUseSupabaseAuth] = useState(!!supabase);

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

  // Check if user exists in Supabase
  const checkSupabaseUser = async (email: string, password: string) => {
    if (!supabase) return null;
    
    try {
      console.log('🔍 Verificando usuário no Supabase:', email);
      
      // Try to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.log('❌ Erro Supabase auth:', error.message);
        return null;
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
          return null;
        }
        
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro na autenticação Supabase:', error);
      return null;
    }
  };

  // Create user in Supabase if doesn't exist
  const createSupabaseUser = async (email: string, password: string, userData: User) => {
    if (!supabase) return false;
    
    try {
      console.log('👤 Criando usuário no Supabase:', email);
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });
      
      if (error) {
        console.log('❌ Erro ao criar usuário Supabase:', error.message);
        return false;
      }
      
      if (data.user) {
        // Insert user profile
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            status: userData.status,
            phone: userData.phone,
            avatar: userData.avatar,
            branch_ids: userData.branchIds,
            pass: password
          });
          
        if (insertError) {
          console.log('❌ Erro ao inserir perfil:', insertError.message);
          return false;
        }
        
        console.log('✅ Usuário criado no Supabase com sucesso');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro ao criar usuário Supabase:', error);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // Check if we have a Supabase session first
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            console.log('🔄 Sessão Supabase encontrada, carregando perfil...');
            
            // Get user profile from Supabase
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
              localStorage.setItem('crm-user', JSON.stringify(userData));
              setLoading(false);
              return;
            }
          }
        } catch (error) {
          console.error('Erro ao verificar sessão Supabase:', error);
        }
      }
      
      // Fallback to localStorage
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
    };
    
    initAuth();
    
    // Listen for auth changes if Supabase is available
    if (supabase) {
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
              localStorage.setItem('crm-user', JSON.stringify(userData));
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('crm-user');
          }
        }
      );
      
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔍 Tentando login para:', email);
      
      // Try Supabase first if available
      if (supabase) {
        const supabaseUser = await checkSupabaseUser(email, password);
        
        if (supabaseUser) {
          console.log('✅ Login Supabase bem-sucedido');
          const userData = {
            id: supabaseUser.id,
            name: supabaseUser.name,
            email: supabaseUser.email,
            phone: supabaseUser.phone,
            role: supabaseUser.role,
            status: supabaseUser.status,
            branchIds: supabaseUser.branch_ids || [],
            avatar: supabaseUser.avatar,
            createdAt: new Date(supabaseUser.created_at),
            updatedAt: new Date(supabaseUser.updated_at)
          };
          
          setUser(userData);
          localStorage.setItem('crm-user', JSON.stringify(userData));
          setLoading(false);
          return;
        }
      }
      
      // Fallback to localStorage users
      const users = getUsers();
      console.log('👥 Usuários locais disponíveis:', users.map((u: User) => ({ email: u.email })));
      
      const foundUser = users.find((u: User) => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (!foundUser) {
        console.log('❌ Usuário não encontrado localmente');
        throw new Error('Email ou senha inválidos');
      }
      
      console.log('✅ Login local bem-sucedido para:', foundUser.name);
      
      // If Supabase is available, try to migrate user
      if (supabase) {
        console.log('🔄 Tentando migrar usuário para Supabase...');
        const migrated = await createSupabaseUser(email, password, foundUser);
        if (migrated) {
          console.log('✅ Usuário migrado para Supabase');
          // Re-login with Supabase
          const supabaseUser = await checkSupabaseUser(email, password);
          if (supabaseUser) {
            const userData = {
              id: supabaseUser.id,
              name: supabaseUser.name,
              email: supabaseUser.email,
              phone: supabaseUser.phone,
              role: supabaseUser.role,
              status: supabaseUser.status,
              branchIds: supabaseUser.branch_ids || [],
              avatar: supabaseUser.avatar,
              createdAt: new Date(supabaseUser.created_at),
              updatedAt: new Date(supabaseUser.updated_at)
            };
            
            setUser(userData);
            localStorage.setItem('crm-user', JSON.stringify(userData));
            setLoading(false);
            return;
          }
        }
      }
      
      // Use local user
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
    if (supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('crm-user');
  };
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