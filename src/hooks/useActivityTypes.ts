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
      // Primeiro tentar buscar por UUID direto
      const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
      
      if (isUUID) {
        const { data, error } = await supabase
          .from('activity_types')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data as ActivityType;
      } else {
        // Buscar por nome/categoria usando a function SQL
        const { data, error } = await supabase
          .rpc('get_activity_type_by_name_or_id', { input_value: id });

        if (error) throw error;
        if (!data || data.length === 0) {
          throw new Error(`Activity type '${id}' not found`);
        }
        return data[0] as ActivityType;
      }
    },
    enabled: !!id,
  });
};

// Hook para buscar activity type por categoria (usado no ActivityStart)
export const useActivityTypeByCategory = (category: string) => {
  return useQuery({
    queryKey: ['activity-type-by-category', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_types')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('difficulty')
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error(`No activity type found for category '${category}'`);
      }
      return data[0] as ActivityType;
    },
    enabled: !!category,
  });
}; 