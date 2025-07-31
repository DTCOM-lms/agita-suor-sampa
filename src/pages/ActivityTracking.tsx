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
  
  // Manual Timer States (para atividades sem GPS)
  const [isManualTracking, setIsManualTracking] = useState(false);
  const [manualDuration, setManualDuration] = useState(0);
  const manualIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const manualStartTimeRef = useRef<number | null>(null);
  const manualPausedTimeRef = useRef<number>(0);
  
  // Função helper para iniciar timer manual
  const startManualTimer = () => {
    console.log('🚀 startManualTimer chamada');
    
    // Limpar timer existente
    if (manualIntervalRef.current) {
      clearInterval(manualIntervalRef.current);
      manualIntervalRef.current = null;
    }
    
    // Iniciar novo timer
    manualIntervalRef.current = setInterval(() => {
      setManualDuration(prev => {
        const newDuration = prev + 1;
        console.log('🟢 TIMER TICK:', newDuration);
        return newDuration;
      });
    }, 1000);
    
    console.log('✅ Timer manual iniciado com sucesso');
  };
  
  // Função helper para parar timer manual
  const stopManualTimer = () => {
    if (manualIntervalRef.current) {
      clearInterval(manualIntervalRef.current);
      manualIntervalRef.current = null;
      console.log('⏹️ Timer manual parado');
    }
  };
  
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
  
  // Determinar tipo de tracking baseado no supports_gps
  const requiresGPS = activityTypeData?.supports_gps === true; // Explicit comparison
  const isTracking = requiresGPS ? gpsStats.isTracking : isManualTracking;
  
  // Debug logs DETALHADO
  useEffect(() => {
    if (activityTypeData) {
      console.log('🔍 ATIVIDADE DEBUG COMPLETO:', {
        '1_activityName': activityTypeData.name,
        '2_supports_gps_RAW': activityTypeData.supports_gps,
        '3_supports_gps_type': typeof activityTypeData.supports_gps,
        '4_requiresGPS_CALCULATED': requiresGPS,
        '5_isManualTracking': isManualTracking,
        '6_isGPSTracking': gpsStats.isTracking,
        '7_finalIsTracking': isTracking,
        '8_activityTypeLoading': activityTypeLoading,
        '9_TODOS_OS_DADOS': activityTypeData
      });
      
      // Debug específico para Aeróbica
      if (activityTypeData.name.toLowerCase().includes('aeróbica') || 
          activityTypeData.name.toLowerCase().includes('aerobica')) {
        console.log('🔴 AERÓBICA DETECTADA - ANÁLISE ESPECÍFICA:', {
          'NOME_EXATO': activityTypeData.name,
          'SUPPORTS_GPS_VALOR': activityTypeData.supports_gps,
          'DEVE_SER_FALSE': 'Aeróbica deve ter supports_gps = false',
          'REQUIRES_GPS_RESULTADO': requiresGPS,
          'PROBLEMA': requiresGPS ? 'ERRO: Aeróbica não deveria precisar de GPS!' : 'OK: Aeróbica não precisa de GPS'
        });
      }
    } else {
      console.log('⚠️ ActivityTypeData não carregado ainda:', { 
        activityTypeLoading, 
        activityTypeId 
      });
    }
  }, [activityTypeData, requiresGPS, isManualTracking, gpsStats.isTracking, isTracking, activityTypeLoading]);

  // Obter localização atual sempre (para mostrar no mapa mesmo em atividades manuais)
  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: Date.now()
            };
            
            console.log('📍 Localização atual obtida:', newLocation);
            setCurrentLocation(newLocation);
          },
          (error) => {
            console.warn('⚠️ Erro ao obter localização:', error);
            // Fallback para localização padrão (centro de São Paulo)
            setCurrentLocation({
              lat: -23.5505,
              lng: -46.6333,
              timestamp: Date.now()
            });
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000 // Cache por 1 minuto
          }
        );
      } else {
        console.warn('⚠️ Geolocalização não suportada');
        // Fallback para centro de São Paulo
        setCurrentLocation({
          lat: -23.5505,
          lng: -46.6333,
          timestamp: Date.now()
        });
      }
    };

    // Obter localização imediatamente
    getCurrentLocation();

    // Para atividades manuais, atualizar localização a cada 2 minutos
    let locationInterval: NodeJS.Timeout | null = null;
    if (!requiresGPS && isTracking) {
      locationInterval = setInterval(getCurrentLocation, 120000); // 2 minutos
    }

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, [requiresGPS, isTracking]);

  // GPS cleanup é gerenciado pelo hook useGPSTracking

  // Manual Timer Effect (para atividades sem GPS) - VERSÃO ROBUSTA
  useEffect(() => {
    console.log('⏱️ Timer Effect V2:', {
      requiresGPS,
      isManualTracking,
      isPaused,
      shouldStartTimer: !requiresGPS && isManualTracking && !isPaused,
      hasInterval: !!manualIntervalRef.current
    });
    
    // Limpar interval existente primeiro
    if (manualIntervalRef.current) {
      console.log('🧹 Limpando interval existente');
      clearInterval(manualIntervalRef.current);
      manualIntervalRef.current = null;
    }
    
    // Iniciar timer apenas se:
    // 1. Não requer GPS
    // 2. Está em tracking manual
    // 3. Não está pausado
    if (!requiresGPS && isManualTracking && !isPaused) {
      console.log('🚀 INICIANDO Timer Manual - Condições atendidas!');
      
      manualIntervalRef.current = setInterval(() => {
        setManualDuration(prev => {
          const newDuration = prev + 1;
          console.log('⏱️ TICK:', newDuration, 'segundos');
          return newDuration;
        });
      }, 1000);
      
      console.log('✅ Timer manual criado com ID:', manualIntervalRef.current);
    } else {
      console.log('⛔ Timer NÃO iniciado. Razões:', {
        requiresGPS: requiresGPS ? 'PRECISA GPS' : 'NÃO PRECISA GPS',
        isManualTracking: isManualTracking ? 'TRACKING ATIVO' : 'TRACKING INATIVO',
        isPaused: isPaused ? 'PAUSADO' : 'NÃO PAUSADO'
      });
    }
    
    // Cleanup function
    return () => {
      if (manualIntervalRef.current) {
        console.log('🧹 Cleanup: removendo timer manual');
        clearInterval(manualIntervalRef.current);
        manualIntervalRef.current = null;
      }
    };
  }, [requiresGPS, isManualTracking, isPaused]);

  // Sincronizar estatísticas (GPS ou Manual)
  useEffect(() => {
    if (activityTypeData && isTracking) {
      let currentDuration, currentDistance, currentPace;
      
      if (requiresGPS) {
        // Usar dados do GPS
        currentDuration = gpsStats.duration;
        currentDistance = gpsStats.totalDistance;
        currentPace = gpsStats.pace;
        
        // Atualizar localização atual para compatibilidade
        if (gpsStats.currentPosition) {
          setCurrentLocation({
            lat: gpsStats.currentPosition.latitude,
            lng: gpsStats.currentPosition.longitude,
            timestamp: gpsStats.currentPosition.timestamp
          });
        }
      } else {
        // Usar timer manual
        currentDuration = manualDuration;
        currentDistance = 0; // Atividades sem GPS não têm distância
        currentPace = 0; // Sem pace para atividades estáticas
      }
      
      const durationMinutes = currentDuration / 60;
      const baseRate = activityTypeData.base_suor_per_minute;
      const multiplier = activityTypeData.intensity_multiplier || 1;
      const distanceBonus = currentDistance > 0 ? (currentDistance / 1000) * 2 : 0; // 2 SUOR por km
      
      const suorEarned = Math.floor((baseRate * durationMinutes * multiplier) + distanceBonus);
      
      setStats({
        duration: currentDuration,
        distance: currentDistance,
        pace: currentPace,
        suorEarned
      });
    }
  }, [gpsStats, manualDuration, activityTypeData, isTracking, requiresGPS]);

  const startTracking = async () => {
    if (!activityTypeData || !user) {
      toast.error("Dados da atividade não carregados");
      return;
    }

    console.log('🚀 INICIANDO ATIVIDADE - ANÁLISE COMPLETA:', {
      '1_NOME': activityTypeData.name,
      '2_SUPPORTS_GPS_RAW': activityTypeData.supports_gps,
      '3_REQUIRES_GPS_CALC': requiresGPS,
      '4_IS_GPS_AVAILABLE': isGPSAvailable,
      '5_DECISION': requiresGPS ? 'VAI USAR GPS' : 'VAI USAR TIMER MANUAL',
      '6_TODOS_DADOS': activityTypeData
    });
    
    // Alerta específico para Aeróbica
    if (activityTypeData.name.toLowerCase().includes('aeróbica')) {
      console.log('🔴 AERÓBICA - VERIFICAÇÃO FINAL:', {
        'PROBLEMA': requiresGPS ? '😨 ERRO: Aeróbica VAI USAR GPS (ERRADO!)' : '✅ OK: Aeróbica vai usar timer manual',
        'REQUIRES_GPS': requiresGPS,
        'SUPPORTS_GPS': activityTypeData.supports_gps
      });
    }

    // Verificar GPS apenas se a atividade requer GPS
    if (requiresGPS && !isGPSAvailable) {
      toast.error("GPS não disponível para esta atividade");
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
        
        if (requiresGPS) {
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
          // Iniciar timer manual
          console.log('🚀 INICIANDO ATIVIDADE MANUAL:', activityTypeData.name);
          
          // Configurar states
          setIsManualTracking(true);
          setManualDuration(0);
          manualStartTimeRef.current = Date.now();
          manualPausedTimeRef.current = 0;
          
          // Iniciar timer imediatamente
          startManualTimer();
          
          toast.success("✅ Atividade iniciada! Timer ativo.");
          
          // Verificar após 3 segundos se está funcionando
          setTimeout(() => {
            console.log('🔍 Verificação final (3s):', {
              manualDuration,
              isTracking,
              hasTimer: !!manualIntervalRef.current
            });
            
            // Se não estiver funcionando, tentar novamente
            if (!manualIntervalRef.current) {
              console.log('🚑 FALLBACK: Timer não estava ativo, forçando novamente');
              startManualTimer();
            }
          }, 3000);
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
    
    if (requiresGPS) {
      // GPS tracking pause logic (mantém o comportamento original)
      if (!isPaused) {
        // Starting pause
        pausedTimeRef.current += Date.now() - (startTimeRef.current || Date.now());
      } else {
        // Resuming
        startTimeRef.current = Date.now();
      }
    } else {
      // Manual tracking pause logic
      if (!isPaused) {
        // Starting pause
        console.log('⏸️ Pausando timer manual');
        stopManualTimer();
        manualPausedTimeRef.current += Date.now() - (manualStartTimeRef.current || Date.now());
      } else {
        // Resuming  
        console.log('▶️ Retomando timer manual');
        manualStartTimeRef.current = Date.now();
        startManualTimer();
      }
    }
    
    toast.info(isPaused ? "Atividade retomada" : "Atividade pausada");
  };

  const stopTracking = async () => {
    // Parar tracking baseado no tipo
    if (requiresGPS) {
      stopGPSTracking();
    } else {
      console.log('⏹️ Finalizando atividade manual');
      stopManualTimer();
      setIsManualTracking(false);
    }
    
    setIsPaused(false);

    // Atualizar atividade no Supabase se foi criada
    if (currentActivityId) {
      try {
        const routeData = requiresGPS ? exportRouteData() : { points: [] };
        const finalDuration = requiresGPS ? gpsStats.duration : manualDuration;
        const finalDistance = requiresGPS ? gpsStats.totalDistance : 0;
        
        await updateActivity.mutateAsync({
          activityId: currentActivityId,
          updates: {
            end_time: new Date().toISOString(),
            duration_minutes: Math.round(finalDuration / 60),
            distance_km: finalDistance / 1000,
            gps_route: routeData.points.length > 0 ? routeData.points : null,
            end_location: (requiresGPS && gpsStats.currentPosition) ? {
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
        route: requiresGPS ? gpsStats.route : [],
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

        {/* GPS Status - Só mostrar para atividades que usam GPS */}
        {requiresGPS && (
          <GPSStatus 
            gpsStats={gpsStats}
            accuracy={accuracy}
            isGPSAvailable={isGPSAvailable}
            gpsError={gpsError}
          />
        )}

        {/* Stats Grid - Adaptado para GPS vs Manual */}
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
                {requiresGPS 
                  ? (stats.distance < 1000 
                      ? `${Math.round(stats.distance)}m`
                      : `${(stats.distance / 1000).toFixed(2)}km`)
                  : '--'
                }
              </div>
              <div className="text-sm text-muted-foreground">
                {requiresGPS ? 'Distância' : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              {requiresGPS ? (
                <>
                  <Gauge className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">
                    {gpsStats.currentSpeed.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">km/h</div>
                </>
              ) : (
                <>
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold">
                    {Math.round(stats.suorEarned)}
                  </div>
                  <div className="text-sm text-muted-foreground">SUOR</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              {requiresGPS ? (
                <>
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">
                    {stats.pace > 0 && isFinite(stats.pace) 
                      ? `${Math.floor(stats.pace)}:${String(Math.round((stats.pace % 1) * 60)).padStart(2, '0')}`
                      : '--:--'
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">min/km</div>
                </>
              ) : (
                <>
                  <Timer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                  <div className="text-2xl font-bold">
                    {activityTypeData?.base_suor_per_minute || 0}/min
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa SUOR</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 pt-4">
          {!isTracking ? (
            <Button 
              onClick={startTracking} 
              className="flex-1 h-14 text-lg gap-2"
              disabled={requiresGPS && !isGPSAvailable}
            >
              <Play className="h-5 w-5" />
              {requiresGPS ? 'Iniciar com GPS' : 'Iniciar Timer'}
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