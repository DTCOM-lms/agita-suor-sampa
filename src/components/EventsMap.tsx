import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, Star, Clock, Target } from "lucide-react";
import { Event, EventMapPin } from '@/types/events';
import { env } from '@/config/environment';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface EventsMapProps {
  events: Event[];
  userLocation?: { lat: number; lng: number } | null;
  isLoading?: boolean;
  className?: string;
}

const EventsMap: React.FC<EventsMapProps> = ({ 
  events, 
  userLocation, 
  isLoading = false,
  className = "" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Inicializar Mapbox
  useEffect(() => {
    if (!mapContainer.current || map.current || !env.mapbox.accessToken) return;

    console.log('🗺️ Inicializando mapa de eventos...');
    
    // Configurar token do Mapbox
    mapboxgl.accessToken = env.mapbox.accessToken;

    // Criar mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [-46.6333, -23.5505], // São Paulo
      zoom: userLocation ? 13 : 12,
      pitch: 0,
      bearing: 0
    });

    // Adicionar controles
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right');

    // Evento quando o mapa carrega
    map.current.on('load', () => {
      console.log('🗺️ Mapa de eventos carregado com sucesso!');
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [userLocation]);

  // Atualizar localização do usuário no mapa
  useEffect(() => {
    if (!map.current || !mapLoaded || !userLocation) return;

    console.log('📍 Atualizando localização no mapa:', userLocation);
    
    // Voar para a localização do usuário
    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 13,
      duration: 2000
    });

  }, [userLocation, mapLoaded]);

  // Adicionar markers dos eventos
  useEffect(() => {
    if (!map.current || !mapLoaded || !events?.length) return;

    console.log('🎯 Adicionando markers dos eventos...');

    // Remover markers existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Adicionar novos markers
    events.forEach((event) => {
      if (!event.location) return;

      // Criar elemento HTML para o marker
      const el = document.createElement('div');
      el.className = 'event-marker';
      
      // Estilo baseado no tipo de evento
      const markerColors = {
        caminhada: '#10b981', // verde
        corrida: '#3b82f6',   // azul
        ciclismo: '#f59e0b',  // amarelo
        yoga: '#8b5cf6',      // roxo
        meditacao: '#06b6d4', // ciano
        treino_funcional: '#ef4444', // vermelho
        danca: '#ec4899',     // rosa
        esporte_coletivo: '#6366f1', // índigo
        outro: '#6b7280'      // cinza
      };

      const markerColor = markerColors[event.type] || markerColors.outro;
      
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: ${markerColor};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s;
        position: relative;
      `;
      
      // Adicionar ícone baseado no tipo
      const iconMap = {
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

      el.innerHTML = `<span style="font-size: 20px;">${iconMap[event.type] || iconMap.outro}</span>`;

      // Adicionar indicador de destaque se for featured
      if (event.is_featured) {
        const featuredIndicator = document.createElement('div');
        featuredIndicator.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          width: 16px;
          height: 16px;
          background-color: #fbbf24;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          color: white;
          font-weight: bold;
        `;
        featuredIndicator.innerHTML = '⭐';
        el.appendChild(featuredIndicator);
      }

      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Criar marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.location.lng, event.location.lat])
        .addTo(map.current!);

      // Adicionar evento de clique
      el.addEventListener('click', () => {
        console.log('🎯 Evento selecionado:', event.name);
        setSelectedEvent(event);
        
        // Voar para o marker clicado
        map.current?.flyTo({
          center: [event.location.lng, event.location.lat],
          zoom: 15,
          duration: 1500
        });
      });

      markersRef.current.push(marker);
    });

  }, [events, mapLoaded]);

  // Centralizar mapa nos eventos quando solicitado
  useEffect(() => {
    if (!map.current || !mapLoaded || !events?.length) return;

    // Se há apenas um evento, centralizar nele
    if (events.length === 1 && events[0].location) {
      map.current.flyTo({
        center: [events[0].location.lng, events[0].location.lat],
        zoom: 15,
        duration: 1500
      });
    } else if (events.length > 1) {
      // Múltiplos eventos, calcular bounds
      const bounds = new mapboxgl.LngLatBounds();
      
      events.forEach(event => {
        if (event.location) {
          bounds.extend([event.location.lng, event.location.lat]);
        }
      });

      // Incluir localização do usuário se disponível
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }

      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1500,
        maxZoom: 16
      });
    }
    
  }, [events, mapLoaded, userLocation]);

  // Fallback se não conseguir carregar Mapbox
  if (!env.mapbox.accessToken) {
    return (
      <div className={`relative w-full h-full ${className}`} style={{ minHeight: '500px' }}>
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center p-8">
            <MapPin className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Token Mapbox não configurado</h3>
            <p className="text-gray-500">Configure VITE_MAPBOX_ACCESS_TOKEN no .env.local</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: '500px' }}>
      {/* Container do Mapbox */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Overlay de informações */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {userLocation ? 'Sua localização' : 'São Paulo, SP'}
            </span>
            <span className="text-muted-foreground">• {events?.length || 0} eventos</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg z-10">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando eventos...</span>
          </div>
        </div>
      )}

      {/* Selected event details */}
      {selectedEvent && (
        <Card className="absolute top-16 left-4 right-4 z-20 max-w-sm mx-auto bg-white shadow-xl max-h-96 overflow-y-auto">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                     style={{ backgroundColor: getEventTypeColor(selectedEvent.type) }}>
                  {getEventTypeIcon(selectedEvent.type)}
                </div>
                <CardTitle className="text-lg leading-tight">{selectedEvent.name}</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0"
              >
                ✕
              </Button>
            </div>
            <CardDescription className="text-sm leading-relaxed">{selectedEvent.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Informações do evento */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(selectedEvent.start_date).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(selectedEvent.start_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{selectedEvent.location_name}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedEvent.current_participants}
                  {selectedEvent.max_participants && ` / ${selectedEvent.max_participants}`} participantes
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                {selectedEvent.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedEvent.category}
              </Badge>
              {selectedEvent.is_featured && (
                <Badge variant="default" className="text-xs bg-yellow-500">
                  ⭐ Destaque
                </Badge>
              )}
            </div>

            {/* Recompensa SUOR */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-50 rounded-lg">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <div>
                <div className="font-semibold text-yellow-700">{selectedEvent.suor_reward} SUOR</div>
                <div className="text-xs text-yellow-600">Recompensa por participação</div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                Ver Detalhes
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                Inscrever-se
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Funções auxiliares
function getEventTypeColor(type: string): string {
  const colors = {
    caminhada: '#10b981',
    corrida: '#3b82f6',
    ciclismo: '#f59e0b',
    yoga: '#8b5cf6',
    meditacao: '#06b6d4',
    treino_funcional: '#ef4444',
    danca: '#ec4899',
    esporte_coletivo: '#6366f1',
    outro: '#6b7280'
  };
  return colors[type] || colors.outro;
}

function getEventTypeIcon(type: string): string {
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
}

export default EventsMap;
