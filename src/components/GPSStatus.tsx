import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Satellite, 
  MapPin, 
  Timer, 
  Gauge, 
  Route, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Mountain
} from "lucide-react";
import type { GPSStats } from "@/hooks/useGPSTracking";

interface GPSStatusProps {
  gpsStats: GPSStats;
  accuracy: number | null;
  isGPSAvailable: boolean;
  gpsError: string | null;
}

const GPSStatus = ({ gpsStats, accuracy, isGPSAvailable, gpsError }: GPSStatusProps) => {
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatSpeed = (kmh: number): string => {
    return `${kmh.toFixed(1)} km/h`;
  };

  const formatPace = (pace: number): string => {
    if (pace === 0 || !isFinite(pace)) return "-- min/km";
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAccuracyStatus = (): { color: string; label: string; icon: React.ReactNode } => {
    if (!accuracy) {
      return { 
        color: 'text-muted-foreground', 
        label: 'Carregando...', 
        icon: <Satellite className="w-4 h-4" />
      };
    }
    
    if (accuracy <= 5) {
      return { 
        color: 'text-green-500', 
        label: 'Excelente', 
        icon: <CheckCircle2 className="w-4 h-4" />
      };
    } else if (accuracy <= 15) {
      return { 
        color: 'text-blue-500', 
        label: 'Boa', 
        icon: <CheckCircle2 className="w-4 h-4" />
      };
    } else if (accuracy <= 30) {
      return { 
        color: 'text-yellow-500', 
        label: 'Regular', 
        icon: <AlertTriangle className="w-4 h-4" />
      };
    } else {
      return { 
        color: 'text-red-500', 
        label: 'Ruim', 
        icon: <AlertTriangle className="w-4 h-4" />
      };
    }
  };

  const accuracyStatus = getAccuracyStatus();

  if (!isGPSAvailable) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">GPS não disponível</span>
          </div>
          <p className="text-sm text-red-500 mt-1">
            Este dispositivo não suporta geolocalização
          </p>
        </CardContent>
      </Card>
    );
  }

  if (gpsError) {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Erro de GPS</span>
          </div>
          <p className="text-sm text-yellow-600 mt-1">{gpsError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* GPS Status Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-full ${gpsStats.isTracking ? 'bg-green-500' : 'bg-gray-400'}`}>
                <Satellite className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">
                GPS {gpsStats.isTracking ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <Badge variant={gpsStats.isTracking ? 'default' : 'secondary'}>
              {gpsStats.route.length} pontos
            </Badge>
          </div>

          {/* Accuracy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {accuracyStatus.icon}
              <span className="text-sm">Precisão</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${accuracyStatus.color}`}>
                {accuracyStatus.label}
              </span>
              {accuracy && (
                <span className="text-xs text-muted-foreground">
                  ±{Math.round(accuracy)}m
                </span>
              )}
            </div>
          </div>

          {/* Accuracy Progress Bar */}
          {accuracy && (
            <div className="mt-2">
              <Progress 
                value={Math.max(0, 100 - Math.min(accuracy, 50) * 2)} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Stats */}
      {gpsStats.isTracking && (
        <div className="grid grid-cols-2 gap-4">
          {/* Distance & Duration */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Distância</span>
                </div>
                <div className="text-xl font-bold">
                  {formatDistance(gpsStats.totalDistance)}
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Timer className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Tempo</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatDuration(gpsStats.duration)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Speed & Pace */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Velocidade</span>
                </div>
                <div className="text-xl font-bold">
                  {formatSpeed(gpsStats.currentSpeed)}
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-muted-foreground">Ritmo</span>
                </div>
                <div className="text-lg font-semibold">
                  {formatPace(gpsStats.pace)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Stats */}
      {gpsStats.isTracking && gpsStats.totalDistance > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Estatísticas Detalhadas</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Velocidade Média:</span>
                  <span className="font-medium">{formatSpeed(gpsStats.averageSpeed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Velocidade Máxima:</span>
                  <span className="font-medium">{formatSpeed(gpsStats.maxSpeed)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {gpsStats.elevationGain > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Mountain className="w-3 h-3" />
                      Elevação:
                    </span>
                    <span className="font-medium">+{Math.round(gpsStats.elevationGain)}m</span>
                  </div>
                )}
                
                {gpsStats.currentPosition && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Posição:
                    </span>
                    <span className="font-medium text-xs">
                      {gpsStats.currentPosition.latitude.toFixed(6)}, {gpsStats.currentPosition.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GPSStatus; 