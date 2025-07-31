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
  status: 'active' | 'completed' | 'paused' | 'cancelled';
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
          activity_types!inner(name, category, difficulty, base_suor_per_minute)
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
      console.log('🚀 INICIANDO createActivity mutation:', {
        user_id: user?.id,
        activityData,
        isAuthenticated: !!user?.id
      });

      if (!user?.id) {
        console.error('❌ USUÁRIO NÃO AUTENTICADO');
        throw new Error('User not authenticated');
      }

      const now = new Date().toISOString();
      console.log('⏰ Timestamp criado:', now);
      
      // Preparar dados para inserção
      const insertData: any = {
        user_id: user.id,
        title: activityData.title,
        description: activityData.description,
        activity_type_id: activityData.activity_type_id,
        started_at: now,
        start_time: now, // Redundante mas garante compatibilidade
        suor_earned: 0,
        is_public: true,
        status: 'active'
      };

      // Usar RPC para inserir com geometria correta se temos localização
      if (activityData.start_location) {
        console.log('🔍 USANDO RPC create_activity_with_location com localização:', {
          user_id: user.id,
          title: activityData.title,
          activity_type_id: activityData.activity_type_id,
          longitude: activityData.start_location.lng,
          latitude: activityData.start_location.lat
        });

        const { data, error } = await supabase
          .rpc('create_activity_with_location', {
            p_user_id: user.id,
            p_title: activityData.title,
            p_activity_type_id: activityData.activity_type_id,
            p_start_time: now,
            p_longitude: activityData.start_location.lng,
            p_latitude: activityData.start_location.lat,
            p_description: activityData.description,
            p_suor_earned: 0,
            p_is_public: true,
            p_status: 'active'
          });

        console.log('🔍 RESULTADO RPC create_activity_with_location:', { data, error });

        if (error) {
          console.error('❌ ERRO RPC create_activity_with_location:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.error('❌ RPC retornou dados vazios:', data);
          throw new Error('RPC create_activity_with_location retornou dados vazios');
        }

        const activity = data[0];
        console.log('✅ ATIVIDADE CRIADA VIA RPC:', activity);
        return activity;
      } else {
        // Inserção sem localização
        console.log('🔍 USANDO INSERT DIRETO sem localização:', {
          user_id: user.id,
          title: activityData.title,
          activity_type_id: activityData.activity_type_id,
          insertData
        });

        const { data, error } = await supabase
          .from('activities')
          .insert(insertData)
          .select('*')
          .single();

        console.log('🔍 RESULTADO INSERT DIRETO:', { data, error });

        if (error) {
          console.error('❌ ERRO INSERT DIRETO:', error);
          throw error;
        }

        if (!data) {
          console.error('❌ INSERT DIRETO retornou dados vazios:', data);
          throw new Error('INSERT direto retornou dados vazios');
        }

        console.log('✅ ATIVIDADE CRIADA VIA INSERT DIRETO:', data);
        return data;
      }
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
            activity_types!inner(base_suor_per_minute, intensity_multiplier)
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
      let data, error;
      
      if (updates.end_location) {
        // Usar RPC para atualizar com geometria
        const result = await supabase
          .rpc('update_activity_with_end_location', {
            p_activity_id: activityId,
            p_user_id: user.id,
            p_end_time: updates.end_time,
            p_longitude: updates.end_location.lng,
            p_latitude: updates.end_location.lat,
            p_duration_minutes: updates.duration_minutes,
            p_distance_km: updates.distance_km,
            p_gps_route: updates.gps_route,
            p_suor_earned: suorEarned,
            p_status: updates.status || 'completed'
          });
        
        data = result.data?.[0];
        error = result.error;
      } else {
        // Atualização sem localização final
        const result = await supabase
          .from('activities')
          .update({
            ...updates,
            suor_earned: suorEarned,
            ended_at: updates.end_time,
            end_time: updates.end_time,
            updated_at: new Date().toISOString()
          })
          .eq('id', activityId)
          .eq('user_id', user.id)
          .select(`
            *,
            activity_types!inner(name, category)
          `)
          .single();
          
        data = result.data;
        error = result.error;
      }

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
          activity_types!inner(*)
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