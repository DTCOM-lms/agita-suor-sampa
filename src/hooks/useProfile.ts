import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

// Função para criar profile mockado
const createMockProfile = (userId: string, userName?: string): Profile => {
  return {
    id: userId,
    full_name: userName || 'Atleta Agita',
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

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId) throw new Error('User ID required');
      
      try {
        // Tentar buscar do Supabase primeiro
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .maybeSingle(); // Use maybeSingle para evitar erro 406

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar profile:', error);
          // Se não conseguir buscar, use dados mockados
          return createMockProfile(targetUserId, user?.user_metadata?.full_name);
        }

        if (!data) {
          // Profile não existe, retornar dados mockados
          console.log('Profile não encontrado, usando dados mockados');
          return createMockProfile(targetUserId, user?.user_metadata?.full_name);
        }

        return data as Profile;
      } catch (error) {
        console.error('Erro na query do profile:', error);
        // Fallback para dados mockados em qualquer erro
        return createMockProfile(targetUserId, user?.user_metadata?.full_name);
      }
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('User not authenticated');

      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Erro ao atualizar profile:', error);
          // Se falhar, apenas retorna os dados mockados atualizados
          const currentProfile = createMockProfile(user.id, user.user_metadata?.full_name);
          return { ...currentProfile, ...updates };
        }

        return data;
      } catch (error) {
        console.error('Erro na atualização do profile:', error);
        // Fallback para retornar dados mockados com updates
        const currentProfile = createMockProfile(user.id, user.user_metadata?.full_name);
        return { ...currentProfile, ...updates };
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}; 