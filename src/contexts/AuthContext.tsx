import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username?: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  birth_date?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  fitness_level: string;
  city: string;
  neighborhood?: string;
  level: number;
  experience_points: number;
  total_suor: number;
  current_suor: number;
  total_activities: number;
  total_distance_km: number;
  total_duration_minutes: number;
  streak_days: number;
  longest_streak: number;
  last_activity_date?: string;
  is_public: boolean;
  allow_friend_requests: boolean;
  notification_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error: AuthError | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Função para criar profile mockado baseado no usuário
  const createMockProfile = (user: User): Profile => {
    return {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Atleta',
      avatar_url: user.user_metadata?.avatar_url,
      city: 'São Paulo',
      fitness_level: 'beginner',
      level: 1,
      experience_points: 0,
      total_suor: 250,
      current_suor: 250,
      total_activities: 5,
      total_distance_km: 12.5,
      total_duration_minutes: 180,
      streak_days: 3,
      longest_streak: 7,
      is_public: true,
      allow_friend_requests: true,
      notification_preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  };

  const refreshProfile = async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }
    
    // Por enquanto usar dados mockados
    // TODO: Implementar busca real quando a tabela profiles estiver configurada
    setProfile(createMockProfile(user));
  };

  // Buscar profile quando user mudar
  useEffect(() => {
    if (user?.id) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [user?.id]);

  // Monitor loading state changes
  useEffect(() => {
    console.log('🔄 AuthContext: Loading state changed to:', loading);
  }, [loading]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔐 AuthContext: Buscando sessão inicial...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Não foi possível recuperar a sessão.",
        });
      } else {
        console.log('🔐 AuthContext: Sessão encontrada:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
      }
      
      console.log('🔐 AuthContext: Definindo loading = false');
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        console.log('🔐 AuthContext: onAuthStateChange - Event:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in successfully');
          if (session?.user) {
            try {
              await refreshProfile();
            } catch (profileError) {
              console.error('❌ Erro ao carregar perfil após login:', profileError);
              // Não bloquear o login por causa do perfil
              // O usuário pode completar o perfil depois
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
        }
        
        console.log('🔐 AuthContext: onAuthStateChange - Definindo loading = false');
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  // Implementações básicas dos métodos
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('🔐 AuthContext: signUp - setLoading(true)');
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: error.message,
        });
        return { user: null, error };
      }

      if (data.user && !data.session) {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar sua conta antes de fazer login.",
        });
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message,
        });
        return { user: null, error };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, error: error as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no logout",
          description: "Não foi possível fazer logout. Tente novamente.",
        });
        throw error;
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao enviar email",
          description: error.message,
        });
        return { error };
      }

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });

      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      console.log(`🔐 AuthContext: Iniciando login social com ${provider}`);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      console.log(`🔐 AuthContext: Resposta do OAuth ${provider}:`, { data, error });

      if (error) {
        console.error(`❌ Erro no login ${provider}:`, error);
        toast({
          variant: "destructive",
          title: `Erro no login ${provider}`,
          description: getErrorMessage(error as AuthError),
        });
        throw error;
      }

      console.log(`✅ Login ${provider} iniciado com sucesso. Redirecionando...`);
      
      // Don't set loading to false here as the page will redirect
      // The callback page will handle the auth state
      
    } catch (error) {
      console.error(`❌ Erro inesperado no login ${provider}:`, error);
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: `Erro no login ${provider}`,
        description: "Erro inesperado. Tente novamente ou entre em contato com o suporte.",
      });
      
      throw error;
    }
  };

  const updateProfile = async (data: { full_name?: string; avatar_url?: string }) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar perfil",
          description: error.message,
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithProvider,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to get user-friendly error messages
const getErrorMessage = (error: AuthError): string => {
  const message = error.message || '';
  
  // Handle OAuth-specific errors
  if (message.includes('OAuth') || message.includes('oauth')) {
    return 'Erro na autenticação social. Verifique se popups estão habilitados e tente novamente.';
  }
  
  if (message.includes('access_denied')) {
    return 'Acesso negado. Você precisa autorizar o aplicativo para continuar.';
  }
  
  if (message.includes('popup') || message.includes('blocked')) {
    return 'Popup bloqueado. Permita popups para este site e tente novamente.';
  }
  
  if (message.includes('network') || message.includes('Network')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Handle existing errors
  switch (message) {
    case 'Invalid login credentials':
      return 'Email ou senha incorretos. Verifique suas credenciais.';
    case 'Email not confirmed':
      return 'Email não confirmado. Verifique sua caixa de entrada.';
    case 'User already registered':
      return 'Este email já está cadastrado. Tente fazer login.';
    case 'Password should be at least 6 characters':
      return 'A senha deve ter pelo menos 6 caracteres.';
    case 'Unable to validate email address: invalid format':
      return 'Formato de email inválido.';
    case 'Signup is disabled':
      return 'Cadastro temporariamente desabilitado.';
    case 'Email rate limit exceeded':
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    default:
      console.error('Erro não mapeado:', error);
      return message || 'Ocorreu um erro inesperado. Tente novamente.';
  }
}; 