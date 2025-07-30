import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Target, MapPin } from "lucide-react";
import { useNearbyChallenges } from '@/hooks/useChallenges';
import { env } from '@/config/environment';

// Import Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

interface MainMapProps {
  className?: string;
}

const MainMap: React.FC<MainMapProps> = ({ className = "" }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedPin, setSelectedPin] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const { data: challenges, isLoading: challengesLoading, error: challengesError } = useNearbyChallenges(userLocation || undefined);

  // Obter localização do usuário
  useEffect(() => {
    console.log('🌍 Attempting to get user location...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 Localização obtida:', position.coords);
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('⚠️ Erro ao obter localização:', error);
          // Usar localização padrão de São Paulo
          setUserLocation({
            lat: -23.5505,
            lng: -46.6333
          });
        }
      );
    } else {
      console.log('🌍 Geolocalização não suportada, usando São Paulo');
      setUserLocation({
        lat: -23.5505,
        lng: -46.6333
      });
    }
  }, []);

  // Inicializar Mapbox
  useEffect(() => {
    if (!mapContainer.current || map.current || !env.mapbox.accessToken) return;

    console.log('🗺️ Inicializando Mapbox...');
    
    // Configurar token do Mapbox
    mapboxgl.accessToken = env.mapbox.accessToken;

    // Criar mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-46.6333, -23.5505], // São Paulo
      zoom: 12,
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
      console.log('🗺️ Mapbox carregado com sucesso!');
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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

  // Adicionar markers dos desafios
  useEffect(() => {
    if (!map.current || !mapLoaded || !challenges?.length) return;

    console.log('🎯 Adicionando markers dos desafios...');

    // Remover markers existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Adicionar novos markers
    challenges.forEach((challenge, index) => {
      if (!challenge.location) return;

      // Criar elemento HTML para o marker
      const el = document.createElement('div');
      el.className = 'challenge-marker';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #f97316;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;
      
      // Adicionar ícone
      el.innerHTML = '<svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M7 13.5l3 3 7-7 1.5 1.5L10 19.5l-4.5-4.5L7 13.5z"/></svg>';

      // Hover effects
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Criar marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([challenge.location.lng, challenge.location.lat])
        .addTo(map.current!);

      // Adicionar evento de clique
      el.addEventListener('click', () => {
        console.log('🎯 Desafio selecionado:', challenge.title);
        setSelectedPin({ type: 'challenge', data: challenge });
        
        // Voar para o marker clicado
        map.current?.flyTo({
          center: [challenge.location!.lng, challenge.location!.lat],
          zoom: 15,
          duration: 1500
        });
      });

      markersRef.current.push(marker);
    });

  }, [challenges, mapLoaded]);

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
            <span className="font-medium">São Paulo, SP</span>
            <span className="text-muted-foreground">• {challenges?.length || 0} desafios próximos</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {(challengesLoading || !mapLoaded) && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg p-3 shadow-lg z-10">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>{!mapLoaded ? 'Carregando mapa...' : 'Carregando desafios...'}</span>
          </div>
        </div>
      )}

      {/* Selected pin details */}
      {selectedPin && selectedPin.data && (
        <Card className="absolute bottom-4 left-4 right-4 z-20 max-w-sm mx-auto bg-white shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">{selectedPin.data.title}</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedPin(null)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                ✕
              </Button>
            </div>
            <CardDescription className="text-sm">{selectedPin.data.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                <Trophy className="w-3 h-3 mr-1" />
                {selectedPin.data.reward_suor} SUOR
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                {selectedPin.data.participants_count} pessoas
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {selectedPin.data.progress_percentage}% completo
              </Badge>
            </div>
            <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
              Participar do Desafio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MainMap;
