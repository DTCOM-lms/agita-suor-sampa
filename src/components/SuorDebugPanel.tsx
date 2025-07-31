import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Bug, Zap, Activity, User, RefreshCw } from 'lucide-react';
import { useSuorDebug, useReliableSuor } from '@/hooks/useSuorDebug';

/**
 * Componente temporário para debug do sistema SUOR
 * Para usar: <SuorDebugPanel /> em qualquer página
 * Remover após corrigir inconsistências
 */
export const SuorDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { debug, logDebugInfo, isConsistent } = useSuorDebug();
  const { suor, source, isFromActivities } = useReliableSuor();

  const getStatusColor = (consistent: boolean) => {
    return consistent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getSourceColor = (source: string) => {
    return source === 'activities' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Só mostrar em desenvolvimento
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-2 border-dashed border-gray-400 bg-gray-50">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bug className="h-4 w-4" />
                  SUOR Debug
                  <Badge className={getStatusColor(isConsistent)}>
                    {isConsistent ? '✅ OK' : '⚠️ ISSUE'}
                  </Badge>
                </CardTitle>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Valor Recomendado */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Valor Atual</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{suor} SUOR</div>
                <Badge className={getSourceColor(source)}>
                  {isFromActivities ? '📊 Das Atividades' : '👤 Do Perfil'}
                </Badge>
              </div>

              {/* Comparação de Fontes */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Comparação:</h4>
                
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3" />
                    <span className="text-xs">Atividades</span>
                  </div>
                  <span className="font-mono text-sm">{debug.activities.total_suor_earned}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span className="text-xs">Perfil</span>
                  </div>
                  <span className="font-mono text-sm">{debug.profile.current_suor}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    <span className="text-xs">Hook</span>
                  </div>
                  <span className="font-mono text-sm">{debug.suorBalance.currentSuor}</span>
                </div>
              </div>

              {/* Status de Consistência */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Consistência:</h4>
                
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className={`p-1 rounded ${debug.consistency.profile_vs_activities ? 'bg-green-100' : 'bg-red-100'}`}>
                    Perfil vs Atividades: {debug.consistency.profile_vs_activities ? '✅' : '❌'}
                  </div>
                  <div className={`p-1 rounded ${debug.consistency.activities_vs_balance ? 'bg-green-100' : 'bg-red-100'}`}>
                    Atividades vs Hook: {debug.consistency.activities_vs_balance ? '✅' : '❌'}
                  </div>
                </div>
              </div>

              {/* Diferenças */}
              {!isConsistent && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-red-800 mb-2">Diferenças:</h4>
                  <div className="space-y-1 text-xs">
                    <div>Perfil - Atividades: {debug.differences.profile_minus_activities}</div>
                    <div>Atividades - Hook: {debug.differences.activities_minus_balance}</div>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={logDebugInfo}
                  className="flex-1"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Log Console
                </Button>
              </div>

              {/* Instruções */}
              {!isConsistent && (
                <div className="text-xs text-gray-600 p-2 bg-yellow-50 rounded">
                  💡 <strong>Para corrigir:</strong> Execute <code>SYNC_SUOR_PROFILE_WITH_ACTIVITIES.sql</code> no Supabase
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};