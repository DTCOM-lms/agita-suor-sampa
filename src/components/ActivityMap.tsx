import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Default to São Paulo center
    const defaultCenter: [number, number] = [-46.6333, -23.5505];
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: currentLocation ? [currentLocation.lng, currentLocation.lat] : defaultCenter,
      zoom: currentLocation ? 16 : 12,
      pitch: 45,
    });

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
  };

  // Initialize map when token is provided
  useEffect(() => {
    if (mapboxToken && !map.current) {
      initializeMap();
    }
  }, [mapboxToken]);

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

  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center bg-muted">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Configurar Mapa</CardTitle>
            <CardDescription>
              Para usar o mapa, você precisa inserir sua chave do Mapbox. 
              Acesse <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a> para obter sua chave gratuita.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                type="password"
                placeholder="pk.eyJ1..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => mapboxToken && initializeMap()} 
              disabled={!mapboxToken}
              className="w-full"
            >
              Carregar Mapa
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