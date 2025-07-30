import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, AlertCircle } from "lucide-react";
import { getMapboxToken, isMapboxConfigured, SAO_PAULO_CENTER, DEFAULT_MAP_CONFIG, logMapboxConfig } from '@/utils/mapboxHelpers';

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

interface ActivityMapProps {
  route: LocationPoint[];
  currentLocation: LocationPoint | null;
  isTracking: boolean;
}

const ActivityMap: React.FC<ActivityMapProps> = ({ route, currentLocation, isTracking }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const routeSource = useRef<mapboxgl.GeoJSONSource | null>(null);
  const currentLocationMarker = useRef<mapboxgl.Marker | null>(null);
  
  // Usar utilitários centralizados do Mapbox
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Log da configuração em desenvolvimento
  useEffect(() => {
    logMapboxConfig();
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current) {
      setMapError('Container do mapa não encontrado');
      return;
    }

    const token = getMapboxToken();
    if (!token) {
      setMapError('Token do Mapbox não configurado ou inválido');
      return;
    }

    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: DEFAULT_MAP_CONFIG.style,
        center: currentLocation ? [currentLocation.lng, currentLocation.lat] : DEFAULT_MAP_CONFIG.center,
        zoom: currentLocation ? 16 : DEFAULT_MAP_CONFIG.zoom,
        pitch: DEFAULT_MAP_CONFIG.pitch,
      });

      // Resetar erro se mapa carregou com sucesso
      setMapError(null);

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setIsMapReady(true);
      
      // Add route source
      map.current?.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add route layer
      map.current?.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#007cbf',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });

      routeSource.current = map.current?.getSource('route') as mapboxgl.GeoJSONSource;
    });

    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      setMapError('Erro ao carregar o mapa. Verifique a chave do Mapbox.');
    }
  };

  // Initialize map automatically if token is available
  useEffect(() => {
    if (isMapboxConfigured() && !map.current) {
      initializeMap();
    }
  }, []);

  // Update route
  useEffect(() => {
    if (isMapReady && routeSource.current && route.length > 0) {
      const coordinates = route.map(point => [point.lng, point.lat]);
      
      routeSource.current.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    }
  }, [route, isMapReady]);

  // Update current location marker
  useEffect(() => {
    if (isMapReady && currentLocation && map.current) {
      if (currentLocationMarker.current) {
        currentLocationMarker.current.remove();
      }

      const el = document.createElement('div');
      el.className = 'current-location-marker';
      el.style.backgroundImage = 'radial-gradient(circle, #007cbf 30%, rgba(0, 124, 191, 0.3) 70%)';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';

      currentLocationMarker.current = new mapboxgl.Marker(el)
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .addTo(map.current!);

      // Center map on current location if tracking
      if (isTracking) {
        map.current.easeTo({
          center: [currentLocation.lng, currentLocation.lat],
          duration: 1000
        });
      }
    }
  }, [currentLocation, isMapReady, isTracking]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (currentLocationMarker.current) {
        currentLocationMarker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (!isMapboxConfigured()) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <CardTitle className="text-destructive">Mapa Não Disponível</CardTitle>
            <CardDescription>
              A chave do Mapbox não está configurada. Para usar as funcionalidades de mapa:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>1.</strong> Obtenha uma chave gratuita em: <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a></p>
              <p><strong>2.</strong> Configure no arquivo <code className="bg-muted px-1 rounded">.env.local</code>:</p>
              <div className="bg-muted p-2 rounded text-xs font-mono">
                VITE_MAPBOX_ACCESS_TOKEN=pk.sua_chave_aqui
              </div>
              <p><strong>3.</strong> Reinicie o servidor de desenvolvimento</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
              variant="outline"
            >
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <CardTitle className="text-destructive">Erro no Mapa</CardTitle>
            <CardDescription>{mapError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={initializeMap} 
              className="w-full"
              variant="outline"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityMap;