import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AdminActivityStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface AdminActivity {
  id: string;
  user_id: string;
  title: string | null;
  status: AdminActivityStatus;
  duration_minutes?: number | null;
  distance_km?: number | null;
  suor_earned: number;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  activity_types?: {
    name: string;
    category: string;
  };
}

export const useAdminActivities = (params?: { status?: AdminActivityStatus; search?: string }) => {
  const { status, search } = params || {};
  return useQuery<AdminActivity[]>({
    queryKey: ['admin','activities', { status, search }],
    queryFn: async () => {
      let query = supabase
        .from('activities')
        .select(`
          id,
          user_id,
          title,
          status,
          duration_minutes,
          distance_km,
          suor_earned,
          created_at,
          profiles:profiles!activities_user_id_fkey(id, full_name, avatar_url),
          activity_types:activity_types!activities_activity_type_id_fkey(name, category)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (search && search.trim()) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query as any;
      if (error) throw error;
      return (data || []) as AdminActivity[];
    }
  });
};

export const useAdminUpdateActivityStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ activityId, status }: { activityId: string; status: AdminActivityStatus }) => {
      const { error } = await supabase
        .from('activities')
        .update({ status })
        .eq('id', activityId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin','activities'] });
    }
  });
};

export const useAdminDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (activityId: string) => {
      const { error } = await supabase.from('activities').delete().eq('id', activityId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin','activities'] });
    }
  });
};

