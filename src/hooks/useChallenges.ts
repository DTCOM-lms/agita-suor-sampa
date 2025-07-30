import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'coletivo';
  status: 'active' | 'completed' | 'upcoming';
  start_date: string;
  end_date: string;
  participants_count: number;
  max_participants?: number;
  reward_suor: number;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  progress_percentage: number;
  requirements?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Hook para buscar desafios próximos ao usuário
export const useNearbyChallenges = (userLocation?: { lat: number; lng: number }) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nearby-challenges', user?.id, userLocation],
    queryFn: async () => {
      // Por enquanto retornando dados mock já que a tabela challenges ainda não está implementada
      // TODO: Implementar busca real no Supabase quando a tabela challenges estiver pronta
      
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          title: 'SP Ativa - Janeiro',
          description: 'Participe do desafio municipal! Complete 100km em atividades físicas durante o mês.',
          type: 'coletivo',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          participants_count: 15420,
          max_participants: 50000,
          reward_suor: 500,
          location: {
            lat: -23.5505,
            lng: -46.6333,
            address: 'Centro de São Paulo'
          },
          progress_percentage: 65,
          requirements: {
            distance_km: 100,
            activity_types: ['running', 'cycling', 'walking']
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T12:00:00Z'
        },
        {
          id: '2',
          title: 'Corrida Coletiva Ibirapuera',
          description: 'Desafio coletivo no Parque Ibirapuera. Meta: 1000 corridas no parque.',
          type: 'coletivo',
          status: 'active',
          start_date: '2024-01-15',
          end_date: '2024-02-15',
          participants_count: 456,
          max_participants: 1000,
          reward_suor: 300,
          location: {
            lat: -23.5873,
            lng: -46.6570,
            address: 'Parque Ibirapuera'
          },
          progress_percentage: 34,
          requirements: {
            location_constraint: 'ibirapuera',
            activity_types: ['running']
          },
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-20T12:00:00Z'
        },
        {
          id: '3',
          title: 'Caminhada Vila Madalena',
          description: 'Explore a Vila Madalena caminhando! Complete 50km na região.',
          type: 'individual',
          status: 'active',
          start_date: '2024-01-10',
          end_date: '2024-02-10',
          participants_count: 89,
          reward_suor: 200,
          location: {
            lat: -23.5465,
            lng: -46.6929,
            address: 'Vila Madalena'
          },
          progress_percentage: 0,
          requirements: {
            distance_km: 50,
            location_constraint: 'vila_madalena',
            activity_types: ['walking']
          },
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z'
        }
      ];

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockChallenges;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserChallenges = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-challenges', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // TODO: Implementar busca real no Supabase
      // const { data, error } = await supabase
      //   .from('user_challenges')
      //   .select(`
      //     *,
      //     challenges(*)
      //   `)
      //   .eq('user_id', user.id);

      return [];
    },
    enabled: !!user?.id,
  });
}; 