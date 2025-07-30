import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivityType {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  base_suor_per_minute: number;
  intensity_multiplier: number;
  supports_gps: boolean;
  supports_heart_rate: boolean;
  supports_manual_entry: boolean;
  estimated_calories_per_minute?: number;
  min_duration_minutes: number;
  max_duration_minutes: number;
  icon_name?: string;
  color_hex?: string;
  is_active: boolean;
  created_at: string;
}

export const useActivityTypes = (category?: string) => {
  return useQuery({
    queryKey: ['activity-types', category],
    queryFn: async () => {
      let query = supabase
        .from('activity_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ActivityType[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useActivityType = (id: string) => {
  return useQuery({
    queryKey: ['activity-type', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ActivityType;
    },
    enabled: !!id,
  });
}; 