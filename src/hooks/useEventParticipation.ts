import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  EventParticipant, 
  ParticipationStatus,
  EventParticipationResponse 
} from '@/types/events';

// ====================================
// HOOKS PARA PARTICIPAÇÃO EM EVENTOS
// ====================================

// Inscrever-se em um evento
export const useJoinEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string): Promise<EventParticipationResponse> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se já está inscrito
      const { data: existingParticipation } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipation) {
        return {
          success: false,
          message: 'Você já está inscrito neste evento'
        };
      }

      // Verificar se o evento está cheio
      const { data: event } = await supabase
        .from('events')
        .select('max_participants, current_participants')
        .eq('id', eventId)
        .single();

      if (event?.max_participants && event.current_participants >= event.max_participants) {
        return {
          success: false,
          message: 'Este evento está lotado'
        };
      }

      // Inscrever no evento
      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          status: 'registered'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao se inscrever no evento:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        participant: data,
        message: 'Inscrição realizada com sucesso!'
      };
    },
    onSuccess: (_, eventId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
    },
  });
};

// Cancelar inscrição em um evento
export const useLeaveEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string): Promise<EventParticipationResponse> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se está inscrito
      const { data: participation } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (!participation) {
        return {
          success: false,
          message: 'Você não está inscrito neste evento'
        };
      }

      // Cancelar inscrição
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao cancelar inscrição:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Inscrição cancelada com sucesso'
      };
    },
    onSuccess: (_, eventId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
    },
  });
};

// Fazer check-in em um evento
export const useCheckInEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      eventId, 
      location 
    }: { 
      eventId: string; 
      location?: { lat: number; lng: number } 
    }): Promise<EventParticipationResponse> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se está inscrito
      const { data: participation } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (!participation) {
        return {
          success: false,
          message: 'Você precisa estar inscrito para fazer check-in'
        };
      }

      if (participation.checked_in) {
        return {
          success: false,
          message: 'Você já fez check-in neste evento'
        };
      }

      // Verificar se o evento está ativo
      const { data: event } = await supabase
        .from('events')
        .select('status, start_date, end_date, checkin_suor_reward')
        .eq('id', eventId)
        .single();

      if (!event) {
        return {
          success: false,
          message: 'Evento não encontrado'
        };
      }

      const now = new Date();
      const eventStart = new Date(event.start_date);
      const eventEnd = new Date(event.end_date);

      if (now < eventStart || now > eventEnd) {
        return {
          success: false,
          message: 'Check-in só pode ser feito durante o evento'
        };
      }

      // Fazer check-in
      const updateData: any = {
        checked_in: true,
        checkin_time: new Date().toISOString(),
        status: 'checked_in'
      };

      if (location) {
        updateData.checkin_location = `POINT(${location.lng} ${location.lat})`;
      }

      const { data, error } = await supabase
        .from('event_participants')
        .update(updateData)
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao fazer check-in:', error);
        throw new Error(error.message);
      }

      // Adicionar SUOR se houver recompensa
      if (event.checkin_suor_reward > 0) {
        // TODO: Implementar sistema de SUOR
        console.log(`💰 ${event.checkin_suor_reward} SUOR ganhos pelo check-in!`);
      }

      return {
        success: true,
        participant: data,
        message: 'Check-in realizado com sucesso!'
      };
    },
    onSuccess: (_, { eventId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
    },
  });
};

// Atualizar status de participação
export const useUpdateParticipationStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      eventId, 
      status 
    }: { 
      eventId: string; 
      status: ParticipationStatus 
    }): Promise<EventParticipationResponse> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se está inscrito
      const { data: participation } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (!participation) {
        return {
          success: false,
          message: 'Você não está inscrito neste evento'
        };
      }

      // Atualizar status
      const { data, error } = await supabase
        .from('event_participants')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar status:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        participant: data,
        message: 'Status atualizado com sucesso'
      };
    },
    onSuccess: (_, { eventId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
    },
  });
};

// Avaliar evento
export const useRateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      eventId, 
      rating, 
      feedback 
    }: { 
      eventId: string; 
      rating: number; 
      feedback?: string 
    }): Promise<EventParticipationResponse> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      if (rating < 1 || rating > 5) {
        return {
          success: false,
          message: 'Avaliação deve ser entre 1 e 5'
        };
      }

      // Verificar se participou do evento
      const { data: participation } = await supabase
        .from('event_participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (!participation) {
        return {
          success: false,
          message: 'Você precisa ter participado do evento para avaliá-lo'
        };
      }

      // Atualizar avaliação
      const { data, error } = await supabase
        .from('event_participants')
        .update({ 
          rating, 
          feedback,
          status: 'completed'
        })
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao avaliar evento:', error);
        throw new Error(error.message);
      }

      return {
        success: true,
        participant: data,
        message: 'Avaliação enviada com sucesso!'
      };
    },
    onSuccess: (_, { eventId }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-events'] });
    },
  });
};

// Buscar eventos do usuário
export const useUserEvents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-events', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          *,
          events!inner(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar eventos do usuário:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};
