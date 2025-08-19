import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, Users, Clock, Star, Target, ChevronRight, MapPinIcon } from "lucide-react";
import { Event } from '@/types/events';
import { useJoinEvent, useLeaveEvent, useCheckInEvent } from '@/hooks/useEventParticipation';
import { useAuth } from '@/contexts/AuthContext';

interface EventsListProps {
  events: Event[];
  isLoading?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

const EventsList: React.FC<EventsListProps> = ({ 
  events, 
  isLoading = false,
  userLocation 
}) => {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  
  // Hooks para ações
  const joinEvent = useJoinEvent();
  const leaveEvent = useLeaveEvent();
  const checkInEvent = useCheckInEvent();

  // Função para calcular distância
  const calculateDistance = (eventLocation: { lat: number; lng: number }) => {
    if (!userLocation) return null;
    
    const R = 6371; // Raio da Terra em km
    const dLat = (eventLocation.lat - userLocation.lat) * Math.PI / 180;
    const dLon = (eventLocation.lng - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(eventLocation.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  // Função para obter status do evento
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (now < startDate) {
      return { status: 'upcoming', label: 'Próximo', color: 'bg-blue-100 text-blue-800' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'active', label: 'Ativo', color: 'bg-green-100 text-green-800' };
    } else {
      return { status: 'completed', label: 'Finalizado', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Função para obter cor do tipo de evento
  const getEventTypeColor = (type: string) => {
    const colors = {
      caminhada: 'bg-green-100 text-green-800',
      corrida: 'bg-blue-100 text-blue-800',
      ciclismo: 'bg-yellow-100 text-yellow-800',
      yoga: 'bg-purple-100 text-purple-800',
      meditacao: 'bg-cyan-100 text-cyan-800',
      treino_funcional: 'bg-red-100 text-red-800',
      danca: 'bg-pink-100 text-pink-800',
      esporte_coletivo: 'bg-indigo-100 text-indigo-800',
      outro: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.outro;
  };

  // Função para obter ícone do tipo de evento
  const getEventTypeIcon = (type: string) => {
    const icons = {
      caminhada: '🚶',
      corrida: '🏃',
      ciclismo: '🚴',
      yoga: '🧘',
      meditacao: '🧘',
      treino_funcional: '💪',
      danca: '💃',
      esporte_coletivo: '⚽',
      outro: '🎯'
    };
    return icons[type] || icons.outro;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Sem eventos
  if (!events || events.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MapPinIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum evento encontrado</h3>
          <p className="text-gray-500 mb-4">
            Tente ajustar os filtros ou verifique se há eventos disponíveis na sua região.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const eventStatus = getEventStatus(event);
        const distance = calculateDistance(event.location);
        
        return (
          <Card key={event.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Ícone do tipo de evento */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl bg-gray-50">
                    {getEventTypeIcon(event.type)}
                  </div>
                </div>

                {/* Conteúdo principal */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                        {event.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    
                    {/* Status e distância */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge className={eventStatus.color}>
                        {eventStatus.label}
                      </Badge>
                      {distance && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{distance}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do evento */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(event.start_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(event.start_date).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{event.location_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.current_participants}
                        {event.max_participants && ` / ${event.max_participants}`}
                      </span>
                    </div>
                  </div>

                  {/* Badges e tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                    <Badge variant="outline">
                      {event.category}
                    </Badge>
                    {event.is_featured && (
                      <Badge variant="default" className="bg-yellow-500">
                        ⭐ Destaque
                      </Badge>
                    )}
                    {event.tags && event.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Recompensa SUOR */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <div>
                      <div className="font-semibold text-yellow-700">
                        {event.suor_reward} SUOR
                      </div>
                      <div className="text-xs text-yellow-600">
                        Recompensa por participação
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                      <Button size="sm" variant="outline">
                        Compartilhar
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {eventStatus.status === 'upcoming' && (
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Inscrever-se
                        </Button>
                      )}
                      {eventStatus.status === 'active' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Fazer Check-in
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EventsList;
