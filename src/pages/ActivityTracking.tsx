import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Timer, 
  Zap,
  TrendingUp,
  Navigation
} from "lucide-react";
import ActivityMap from "@/components/ActivityMap";
import { toast } from "sonner";

interface ActivityStats {
  duration: number;
  distance: number;
  pace: number;
  suorEarned: number;
}

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

const ActivityTracking = () => {
  const { activityType } = useParams();
  const navigate = useNavigate();
  
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<ActivityStats>({
    duration: 0,
    distance: 0,
    pace: 0,
    suorEarned: 0
  });
  const [route, setRoute] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  const activityNames = {
    running: "Corrida",
    cycling: "Ciclismo", 
    walking: "Caminhada"
  };

  const activityMultipliers = {
    running: 1.5,
    cycling: 1.2,
    walking: 1.0
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && !isPaused && startTimeRef.current) {
      interval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current! - pausedTimeRef.current;
        const duration = Math.floor(elapsed / 1000);
        
        const multiplier = activityMultipliers[activityType as keyof typeof activityMultipliers] || 1;
        const suorEarned = Math.floor(duration * multiplier * 2); // 2 SUOR por segundo base
        
        let pace = 0;
        if (stats.distance > 0 && duration > 0) {
          pace = (duration / 60) / (stats.distance / 1000); // min/km
        }
        
        setStats(prev => ({
          ...prev,
          duration,
          pace,
          suorEarned
        }));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTracking, isPaused, stats.distance, activityType]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const startTracking = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newPoint: LocationPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now()
          };

          setCurrentLocation(newPoint);
          
          if (isTracking) {
            setRoute(prev => {
              const updated = [...prev, newPoint];
              
              // Calculate distance
              if (updated.length > 1) {
                const lastPoint = updated[updated.length - 2];
                const segmentDistance = calculateDistance(
                  lastPoint.lat, lastPoint.lng,
                  newPoint.lat, newPoint.lng
                );
                
                setStats(prevStats => ({
                  ...prevStats,
                  distance: prevStats.distance + segmentDistance
                }));
              }
              
              return updated;
            });
          }
        },
        (error) => {
          toast.error("Erro ao acessar GPS: " + error.message);
        },
        options
      );

      if (!isTracking) {
        setIsTracking(true);
        startTimeRef.current = Date.now();
        pausedTimeRef.current = 0;
        toast.success("Atividade iniciada!");
      }
    } else {
      toast.error("GPS não disponível neste dispositivo");
    }
  };

  const pauseTracking = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      // Starting pause
      pausedTimeRef.current += Date.now() - (startTimeRef.current || Date.now());
    } else {
      // Resuming
      startTimeRef.current = Date.now();
    }
    toast.info(isPaused ? "Atividade retomada" : "Atividade pausada");
  };

  const stopTracking = () => {
    setIsTracking(false);
    setIsPaused(false);
    
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Navigate to results page with stats
    navigate("/activity/results", { 
      state: { 
        stats, 
        route, 
        activityType,
        activityName: activityNames[activityType as keyof typeof activityNames]
      } 
    });
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
  };

  const formatPace = (pace: number): string => {
    if (pace === 0 || !isFinite(pace)) return "--:--";
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Map Container */}
      <div className="h-[60vh] relative">
        <ActivityMap 
          route={route}
          currentLocation={currentLocation}
          isTracking={isTracking}
        />
        
        {/* Activity Header */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="px-3 py-1">
                    {activityNames[activityType as keyof typeof activityNames]}
                  </Badge>
                  <div className={`flex items-center gap-2 ${isTracking ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${isTracking && !isPaused ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className="text-sm font-medium">
                      {!isTracking ? 'Pronto' : isPaused ? 'Pausado' : 'Gravando'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">GPS</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Timer className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatTime(stats.duration)}</div>
              <div className="text-sm text-muted-foreground">Tempo</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-6 w-6 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold">{formatDistance(stats.distance)}</div>
              <div className="text-sm text-muted-foreground">Distância</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">{formatPace(stats.pace)}</div>
              <div className="text-sm text-muted-foreground">Ritmo /km</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-success">{stats.suorEarned}</div>
              <div className="text-sm text-muted-foreground">SUOR</div>
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          {!isTracking ? (
            <Button size="lg" onClick={startTracking} className="min-w-[120px]">
              <Play className="mr-2 h-5 w-5" />
              Iniciar
            </Button>
          ) : (
            <>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={pauseTracking}
                className="min-w-[120px]"
              >
                {isPaused ? (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Retomar
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-5 w-5" />
                    Pausar
                  </>
                )}
              </Button>
              
              <Button 
                size="lg" 
                variant="destructive" 
                onClick={stopTracking}
                className="min-w-[120px]"
              >
                <Square className="mr-2 h-5 w-5" />
                Finalizar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTracking;