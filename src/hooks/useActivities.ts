import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateSuorTransaction } from '@/hooks/useSuor';
import { useCheckAchievements } from '@/hooks/useAchievements';
import { useCreateActivityPost } from '@/hooks/useSocialFeed';

interface Activity {
  id: string;
  user_id: string;
  activity_type_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  distance_km?: number;
  calories_burned?: number;
  average_speed_kmh?: number;
  max_speed_kmh?: number;
  elevation_gain_m?: number;
  heart_rate_avg?: number;
  heart_rate_max?: number;
  suor_earned: number;
  gps_route?: any; // JSONB
  start_location?: any; // geometry
  end_location?: any; // geometry
  weather_conditions?: any; // JSONB
  difficulty_rating?: number;
  enjoyment_rating?: number;
  effort_level?: number;
  notes?: string;
  is_public: boolean;
  achievements_earned?: string[];
  status: 'in_progress' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface CreateActivityData {
  activity_type_id: string;
  title: string;
  description?: string;
  start_location?: {lat: number, lng: number};
}

interface UpdateActivityData {
  end_time?: string;
  duration_minutes?: number;
  distance_km?: number;
  calories_burned?: number;
  gps_route?: any;
  end_location?: {lat: number, lng: number};
  notes?: string;
  difficulty_rating?: number;
  enjoyment_rating?: number;
  effort_level?: number;
  status: 'completed' | 'cancelled';
}

export const useUserActivities = (limit = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-activities', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          activity_types(name, category, difficulty, base_suor_per_minute)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as (Activity & {
        activity_types?: {
          name: string;
          category: string;
          difficulty: string;
          base_suor_per_minute: number;
        };
      })[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (activityData: CreateActivityData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          title: activityData.title,
          description: activityData.description,
          activity_type_id: activityData.activity_type_id,
          start_time: new Date().toISOString(),
          start_location: activityData.start_location ? 
            `POINT(${activityData.start_location.lng} ${activityData.start_location.lat})` : null,
          suor_earned: 0,
          is_public: true,
          status: 'in_progress'
        })
        .select(`
          *,
          activity_types(name, category, difficulty, base_suor_per_minute)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-activities'] });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const createSuorTransaction = useCreateSuorTransaction();
  const { checkAndUnlockAchievements } = useCheckAchievements();
  const { createActivityPost } = useCreateActivityPost();

  return useMutation({
    mutationFn: async ({ activityId, updates }: { activityId: string; updates: UpdateActivityData }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // 1. Calcular SUOR se a atividade foi completada
      let suorEarned = 0;
      if (updates.status === 'completed' && updates.duration_minutes) {
        // Buscar dados do tipo de atividade para calcular SUOR
        const { data: activity, error: activityError } = await supabase
          .from('activities')
          .select(`
            activity_type_id,
            activity_types(base_suor_per_minute, intensity_multiplier)
          `)
          .eq('id', activityId)
          .single();

        if (!activityError && activity?.activity_types) {
          const baseRate = activity.activity_types.base_suor_per_minute;
          const multiplier = activity.activity_types.intensity_multiplier || 1;
          const distanceBonus = updates.distance_km ? updates.distance_km * 2 : 0;
          
          suorEarned = Math.round(
            (baseRate * updates.duration_minutes * multiplier) + distanceBonus
          );
        }
      }

      // 2. Atualizar atividade
      const { data, error } = await supabase
        .from('activities')
        .update({
          ...updates,
          suor_earned: suorEarned,
          end_location: updates.end_location ? 
            `POINT(${updates.end_location.lng} ${updates.end_location.lat})` : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', activityId)
        .eq('user_id', user.id)
        .select(`
          *,
          activity_types(name, category)
        `)
        .single();

      if (error) throw error;

      // 3. Criar transação SUOR se ganhou SUOR
      if (suorEarned > 0 && updates.status === 'completed') {
        await createSuorTransaction.mutateAsync({
          type: 'earned',
          source: 'activity',
          amount: suorEarned,
          description: `Atividade completada: ${data.title}`,
          activity_id: activityId,
          metadata: {
            duration_minutes: updates.duration_minutes,
            distance_km: updates.distance_km,
            activity_type: data.activity_types?.name
          }
        });
      }

      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-activities'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['suor-transactions'] });
      
      // Se atividade foi completada
      if (variables.updates.status === 'completed') {
        try {
          // 1. Verificar conquistas automaticamente
          await checkAndUnlockAchievements();
          
          // 2. Criar post social automaticamente
          await createActivityPost(variables.activityId);
        } catch (error) {
          console.error('Erro ao processar atividade completada:', error);
        }
      }
    },
  });
};

export const useActivity = (activityId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          activity_types(*)
        `)
        .eq('id', activityId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Activity & {
        activity_types?: any;
      };
    },
    enabled: !!activityId && !!user?.id,
  });
}; 