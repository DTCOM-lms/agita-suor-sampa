import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUserProfile {
  id: string;
  email?: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  is_admin: boolean;
  is_public: boolean;
  level: number;
  experience_points: number;
  total_suor: number;
  current_suor: number;
  total_activities: number;
  created_at: string;
}

export const useAdminUsers = (search?: string) => {
  return useQuery<AdminUserProfile[]>({
    queryKey: ['admin','users', { search }],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, is_admin, is_public, level, experience_points, total_suor, current_suor, total_activities, created_at')
        .order('created_at', { ascending: false });

      if (search && search.trim()) {
        query = query.ilike('full_name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AdminUserProfile[];
    }
  });
};

export const useAdminToggleAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin','users'] });
    }
  });
};

