import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  total_activities: number;
  total_distance_km: number;
  total_duration_minutes: number;
  total_suor_earned: number;
  avg_duration_minutes: number;
  avg_distance_km: number;
  avg_suor_per_activity: number;
}

export const useUserStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activities')
        .select(`
          id,
          duration_minutes,
          distance_km,
          suor_earned,
          status
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed'); // Só atividades concluídas

      if (error) throw error;

      // Calcular estatísticas
      const activities = data || [];
      const totalActivities = activities.length;
      const totalDistance = activities.reduce((sum, activity) => 
        sum + (activity.distance_km || 0), 0
      );
      const totalDuration = activities.reduce((sum, activity) => 
        sum + (activity.duration_minutes || 0), 0
      );
      const totalSuor = activities.reduce((sum, activity) => 
        sum + (activity.suor_earned || 0), 0
      );

      return {
        total_activities: totalActivities,
        total_distance_km: totalDistance,
        total_duration_minutes: totalDuration,
        total_suor_earned: totalSuor,
        avg_duration_minutes: totalActivities > 0 ? totalDuration / totalActivities : 0,
        avg_distance_km: totalActivities > 0 ? totalDistance / totalActivities : 0,
        avg_suor_per_activity: totalActivities > 0 ? totalSuor / totalActivities : 0,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Atualizar a cada minuto
  });
};

export const useUserActivityHistory = (limit = 50) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-activity-history', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          activity_types!inner(
            id,
            name,
            category,
            difficulty,
            base_suor_per_minute,
            supports_gps
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};