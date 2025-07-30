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
  Navigation,
  CheckCircle,
  AlertCircle,
  Route,
  Gauge
} from "lucide-react";
import ActivityMap from "@/components/ActivityMap";
import GPSStatus from "@/components/GPSStatus";
import { toast } from "sonner";
import { useActivityType } from "@/hooks/useActivityTypes";
import { useCreateActivity, useUpdateActivity } from "@/hooks/useActivities";
import { useAuth } from "@/contexts/AuthContext";
import { useGPSTracking } from "@/hooks/useGPSTracking";

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
  const { activityType: activityTypeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Hooks para dados reais
  const { data: activityTypeData, isLoading: activityTypeLoading } = useActivityType(activityTypeId || '');
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  
  const [isPaused, setIsPaused] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);
  const [stats, setStats] = useState<ActivityStats>({
    duration: 0,
    distance: 0,
    pace: 0,
    suorEarned: 0
  });
  
  // GPS Tracking avançado
  const {
    gpsStats,
    accuracy,
    isGPSAvailable,
    gpsError,
    startTracking: startGPSTracking,
    stopTracking: stopGPSTracking,
    getCurrentPosition,
    exportRouteData
  } = useGPSTracking({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 5000,
    distanceFilter: 3,
    speedSmoothingFactor: 0.3
  });

  // Legacy compatibility
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  
  // Usar dados do GPS avançado
  const isTracking = gpsStats.isTracking;

  // GPS cleanup é gerenciado pelo hook useGPSTracking

  // Sincronizar estatísticas com dados do GPS avançado
  useEffect(() => {
    if (activityTypeData && isTracking) {
      const durationMinutes = gpsStats.duration / 60;
      const baseRate = activityTypeData.base_suor_per_minute;
      const multiplier = activityTypeData.intensity_multiplier || 1;
      const distanceBonus = gpsStats.totalDistance > 0 ? (gpsStats.totalDistance / 1000) * 2 : 0; // 2 SUOR por km
      
      const suorEarned = Math.floor((baseRate * durationMinutes * multiplier) + distanceBonus);
      
      setStats({
        duration: gpsStats.duration,
        distance: gpsStats.totalDistance,
        pace: gpsStats.pace,
        suorEarned
      });
      
      // Atualizar localização atual para compatibilidade
      if (gpsStats.currentPosition) {
        setCurrentLocation({
          lat: gpsStats.currentPosition.latitude,
          lng: gpsStats.currentPosition.longitude,
          timestamp: gpsStats.currentPosition.timestamp
        });
      }
    }
  }, [gpsStats, activityTypeData, isTracking]);

  const startTracking = async () => {
    if (!activityTypeData || !user) {
      toast.error("Dados da atividade não carregados");
      return;
    }

    if (!isGPSAvailable) {
      toast.error("GPS não disponível neste dispositivo");
      return;
    }

    try {
      // Criar atividade no Supabase
      const result = await createActivity.mutateAsync({
        activity_type_id: activityTypeId!,
        title: `${activityTypeData.name} - ${new Date().toLocaleDateString('pt-BR')}`,
        description: `Atividade de ${activityTypeData.name} iniciada`,
        start_location: currentLocation ? {
          lat: currentLocation.lat,
          lng: currentLocation.lng
        } : undefined
      }) as any;

      if (result?.id) {
        setCurrentActivityId(result.id);
        
        // Iniciar GPS tracking
        const gpsStarted = startGPSTracking();
        if (gpsStarted) {
          startTimeRef.current = Date.now();
          pausedTimeRef.current = 0;
          toast.success("Atividade iniciada e GPS ativado!");
        } else {
          throw new Error('Falha ao iniciar GPS');
        }
      } else {
        throw new Error('Falha ao criar atividade');
      }
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      toast.error("Erro ao iniciar atividade");
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

  const stopTracking = async () => {
    // Parar GPS tracking
    stopGPSTracking();
    setIsPaused(false);

    // Atualizar atividade no Supabase se foi criada
    if (currentActivityId) {
      try {
        const routeData = exportRouteData();
        
        await updateActivity.mutateAsync({
          activityId: currentActivityId,
          updates: {
            end_time: new Date().toISOString(),
            duration_minutes: Math.round(gpsStats.duration / 60),
            distance_km: gpsStats.totalDistance / 1000,
            gps_route: routeData.points.length > 0 ? routeData.points : null,
            end_location: gpsStats.currentPosition ? {
              lat: gpsStats.currentPosition.latitude,
              lng: gpsStats.currentPosition.longitude
            } : undefined,
            status: 'completed'
          }
        });
        
        toast.success("Atividade salva com sucesso!");
      } catch (error) {
        console.error('Erro ao salvar atividade:', error);
        toast.error("Erro ao salvar atividade");
      }
    }

    // Navigate to results page with stats
    navigate("/activity/results", {
      state: {
        stats,
        route: gpsStats.route,
        activityTypeId,
        activityName: activityTypeData?.name || 'Atividade',
        activityData: activityTypeData,
        activityId: currentActivityId
      }
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state for activity type data
  if (activityTypeLoading || !activityTypeData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Carregando Atividade</h3>
            <p className="text-muted-foreground">
              Preparando o rastreamento da sua atividade...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Map Container */}
      <div className="h-[40vh] relative">
        <ActivityMap 
          currentLocation={currentLocation}
          route={gpsStats.route.map(p => ({ lat: p.latitude, lng: p.longitude, timestamp: p.timestamp }))}
          isTracking={isTracking}
        />
        
        {/* Back Button */}
        <Button 
          variant="outline" 
          size="icon"
          className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm"
          onClick={() => navigate('/')}
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm p-4 -m-4 mb-4">
          <Card className="bg-background/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="px-3 py-1">
                    {activityTypeData?.name || 'Atividade'}
                  </Badge>
                  <div className={`flex items-center gap-2 ${isTracking ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-2 h-2 rounded-full ${isTracking && !isPaused ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                    <span className="text-sm font-medium">
                      {!isTracking ? 'Pronto' : isPaused ? 'Pausado' : 'Ativo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold text-yellow-600">
                    {stats.suorEarned} SUOR
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GPS Status */}
        <GPSStatus 
          gpsStats={gpsStats}
          accuracy={accuracy}
          isGPSAvailable={isGPSAvailable}
          gpsError={gpsError}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Timer className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{formatTime(stats.duration)}</div>
              <div className="text-sm text-muted-foreground">Tempo</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Route className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">
                {stats.distance < 1000 
                  ? `${Math.round(stats.distance)}m`
                  : `${(stats.distance / 1000).toFixed(2)}km`
                }
              </div>
              <div className="text-sm text-muted-foreground">Distância</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Gauge className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">
                {gpsStats.currentSpeed.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">km/h</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">
                {stats.pace > 0 && isFinite(stats.pace) 
                  ? `${Math.floor(stats.pace)}:${String(Math.round((stats.pace % 1) * 60)).padStart(2, '0')}`
                  : '--:--'
                }
              </div>
              <div className="text-sm text-muted-foreground">min/km</div>
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 pt-4">
          {!isTracking ? (
            <Button 
              onClick={startTracking} 
              className="flex-1 h-14 text-lg gap-2"
              disabled={!isGPSAvailable}
            >
              <Play className="h-5 w-5" />
              Iniciar Atividade
            </Button>
          ) : (
            <>
              <Button 
                onClick={pauseTracking} 
                variant="outline" 
                className="flex-1 h-14 text-lg gap-2"
              >
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                {isPaused ? 'Retomar' : 'Pausar'}
              </Button>
              
              <Button 
                onClick={stopTracking} 
                variant="destructive" 
                className="flex-1 h-14 text-lg gap-2"
              >
                <Square className="h-5 w-5" />
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