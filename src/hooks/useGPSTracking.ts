import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GPSRoute {
  points: GPSPosition[];
  distance: number; // in meters
  duration: number; // in seconds
  averageSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  elevationGain: number; // in meters
}

export interface GPSStats {
  currentPosition?: GPSPosition;
  totalDistance: number; // in meters
  currentSpeed: number; // in km/h
  averageSpeed: number; // in km/h
  maxSpeed: number; // in km/h
  duration: number; // in seconds
  elevationGain: number; // in meters
  pace: number; // min/km
  isTracking: boolean;
  route: GPSPosition[];
}

interface UseGPSTrackingOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number; // minimum distance in meters to record a new point
  speedSmoothingFactor?: number; // 0-1, higher = more smoothing
}

export const useGPSTracking = (options: UseGPSTrackingOptions = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 5000,
    distanceFilter = 3, // 3 meters minimum
    speedSmoothingFactor = 0.3
  } = options;

  // States
  const [gpsStats, setGpsStats] = useState<GPSStats>({
    totalDistance: 0,
    currentSpeed: 0,
    averageSpeed: 0,
    maxSpeed: 0,
    duration: 0,
    elevationGain: 0,
    pace: 0,
    isTracking: false,
    route: []
  });

  const [isGPSAvailable, setIsGPSAvailable] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Refs for tracking
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastPositionRef = useRef<GPSPosition | null>(null);
  const routeRef = useRef<GPSPosition[]>([]);
  const speedHistoryRef = useRef<number[]>([]);
  const elevationHistoryRef = useRef<number[]>([]);

  // Geolocation options
  const geoOptions: PositionOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge
  };

  // Haversine distance calculation (more accurate for GPS)
  const calculateDistance = useCallback((pos1: GPSPosition, pos2: GPSPosition): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Calculate bearing between two points
  const calculateBearing = useCallback((pos1: GPSPosition, pos2: GPSPosition): number => {
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360
  }, []);

  // Smooth speed calculation with exponential moving average
  const smoothSpeed = useCallback((newSpeed: number): number => {
    speedHistoryRef.current.push(newSpeed);
    
    // Keep only last 10 readings for smoothing
    if (speedHistoryRef.current.length > 10) {
      speedHistoryRef.current = speedHistoryRef.current.slice(-10);
    }

         // Calculate exponential moving average
     let smoothedSpeed = speedHistoryRef.current[0];
     for (let i = 1; i < speedHistoryRef.current.length; i++) {
       smoothedSpeed = speedSmoothingFactor * speedHistoryRef.current[i] + 
                      (1 - speedSmoothingFactor) * smoothedSpeed;
     }

    return Math.max(0, smoothedSpeed); // Ensure non-negative
  }, [speedSmoothingFactor]);

  // Calculate elevation gain
  const calculateElevationGain = useCallback((newAltitude: number): number => {
    if (elevationHistoryRef.current.length === 0) {
      elevationHistoryRef.current.push(newAltitude);
      return 0;
    }

    const lastElevation = elevationHistoryRef.current[elevationHistoryRef.current.length - 1];
    const gain = newAltitude > lastElevation ? newAltitude - lastElevation : 0;
    
    elevationHistoryRef.current.push(newAltitude);
    
    // Keep only recent elevation history
    if (elevationHistoryRef.current.length > 100) {
      elevationHistoryRef.current = elevationHistoryRef.current.slice(-100);
    }

    return gain;
  }, []);

  // Process new GPS position
  const processPosition = useCallback((position: GeolocationPosition) => {
    const newPosition: GPSPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      heading: position.coords.heading || undefined,
      speed: position.coords.speed || undefined,
      timestamp: position.timestamp
    };

    setAccuracy(newPosition.accuracy);
    setGpsError(null);

    // Check accuracy threshold
    if (newPosition.accuracy > 50) {
      console.warn('GPS accuracy is low:', newPosition.accuracy);
      return;
    }

    const now = Date.now();
    const currentTime = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;

    // First position
    if (!lastPositionRef.current) {
      lastPositionRef.current = newPosition;
      routeRef.current = [newPosition];
      
      setGpsStats(prev => ({
        ...prev,
        currentPosition: newPosition,
        duration: currentTime
      }));
      return;
    }

    // Calculate distance from last position
    const distanceFromLast = calculateDistance(lastPositionRef.current, newPosition);
    
    // Apply distance filter
    if (distanceFromLast < distanceFilter) {
      return;
    }

    // Calculate time difference
    const timeDiff = (newPosition.timestamp - lastPositionRef.current.timestamp) / 1000; // seconds
    
    // Calculate instantaneous speed (km/h)
    const instantSpeed = timeDiff > 0 ? (distanceFromLast / timeDiff) * 3.6 : 0;
    
    // Use GPS speed if available and reasonable, otherwise use calculated
    const gpsSpeed = newPosition.speed ? newPosition.speed * 3.6 : null;
    const currentSpeed = gpsSpeed && gpsSpeed > 0 && gpsSpeed < 200 
      ? gpsSpeed 
      : instantSpeed;

    // Smooth the speed
    const smoothedSpeed = smoothSpeed(currentSpeed);

    // Add to route
    routeRef.current.push(newPosition);
    
    // Calculate total distance
    const totalDistance = routeRef.current.reduce((total, point, index) => {
      if (index === 0) return 0;
      return total + calculateDistance(routeRef.current[index - 1], point);
    }, 0);

    // Calculate average speed
    const averageSpeed = currentTime > 0 ? (totalDistance / 1000) / (currentTime / 3600) : 0;

    // Calculate elevation gain
    const elevationGain = newPosition.altitude 
      ? elevationHistoryRef.current.reduce((total, _, index) => {
          if (index === 0) return 0;
          const gain = elevationHistoryRef.current[index] > elevationHistoryRef.current[index - 1] 
            ? elevationHistoryRef.current[index] - elevationHistoryRef.current[index - 1] 
            : 0;
          return total + gain;
        }, 0)
      : 0;

    // Calculate pace (min/km)
    const pace = smoothedSpeed > 0 ? 60 / smoothedSpeed : 0;

    // Update stats
    setGpsStats(prev => ({
      currentPosition: newPosition,
      totalDistance,
      currentSpeed: smoothedSpeed,
      averageSpeed,
      maxSpeed: Math.max(prev.maxSpeed, smoothedSpeed),
      duration: currentTime,
      elevationGain,
      pace,
      isTracking: prev.isTracking,
      route: [...routeRef.current]
    }));

    lastPositionRef.current = newPosition;
  }, [calculateDistance, calculateBearing, smoothSpeed, calculateElevationGain, distanceFilter]);

  // Error handler
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Erro de GPS desconhecido';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Permissão de localização negada';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Localização indisponível';
        break;
      case error.TIMEOUT:
        errorMessage = 'Timeout na localização';
        break;
    }

    setGpsError(errorMessage);
    toast.error(`GPS: ${errorMessage}`);
    console.error('GPS Error:', error);
  }, []);

  // Start GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      const error = 'GPS não disponível neste dispositivo';
      setGpsError(error);
      toast.error(error);
      return false;
    }

    if (watchIdRef.current) {
      stopTracking();
    }

    // Reset tracking data
    routeRef.current = [];
    speedHistoryRef.current = [];
    elevationHistoryRef.current = [];
    lastPositionRef.current = null;
    startTimeRef.current = Date.now();

    setGpsStats(prev => ({
      ...prev,
      totalDistance: 0,
      currentSpeed: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      duration: 0,
      elevationGain: 0,
      pace: 0,
      isTracking: true,
      route: []
    }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      processPosition,
      handleError,
      geoOptions
    );

    setIsGPSAvailable(true);
    toast.success('GPS ativado com sucesso!');
    return true;
  }, [processPosition, handleError, geoOptions]);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setGpsStats(prev => ({
      ...prev,
      isTracking: false
    }));

    toast.info('GPS desativado');
  }, []);

  // Get current position once
  const getCurrentPosition = useCallback((): Promise<GPSPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('GPS não disponível'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const gpsPosition: GPSPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || undefined,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
            timestamp: position.timestamp
          };
          resolve(gpsPosition);
        },
        (error) => {
          handleError(error);
          reject(error);
        },
        geoOptions
      );
    });
  }, [handleError, geoOptions]);

  // Export route data
  const exportRouteData = useCallback((): GPSRoute => {
    const route = routeRef.current;
    const totalDistance = gpsStats.totalDistance;
    const duration = gpsStats.duration;
    const averageSpeed = gpsStats.averageSpeed;
    const maxSpeed = gpsStats.maxSpeed;
    const elevationGain = gpsStats.elevationGain;

    return {
      points: route,
      distance: totalDistance,
      duration,
      averageSpeed,
      maxSpeed,
      elevationGain
    };
  }, [gpsStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Check GPS availability on mount
  useEffect(() => {
    setIsGPSAvailable('geolocation' in navigator);
  }, []);

  return {
    // GPS Stats
    gpsStats,
    accuracy,
    isGPSAvailable,
    gpsError,
    
    // GPS Control
    startTracking,
    stopTracking,
    getCurrentPosition,
    
    // Data Export
    exportRouteData,
    
    // Utilities
    calculateDistance,
    calculateBearing
  };
}; 