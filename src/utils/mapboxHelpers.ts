/**
 * 🗺️ Utilitários para Mapbox - Agita
 * 
 * Funções auxiliares para trabalhar com mapas usando
 * a configuração centralizada de environment.
 */

import { env } from '@/config/environment';

/**
 * Verificar se o Mapbox está configurado
 */
export const isMapboxConfigured = (): boolean => {
  return !!env.mapbox.accessToken && env.mapbox.accessToken.startsWith('pk.');
};

/**
 * Obter token do Mapbox com validação
 */
export const getMapboxToken = (): string | null => {
  const token = env.mapbox.accessToken;
  
  if (!token) {
    console.warn('⚠️  Token do Mapbox não configurado');
    return null;
  }
  
  if (!token.startsWith('pk.')) {
    console.error('❌ Token do Mapbox inválido. Deve começar com "pk."');
    return null;
  }
  
  return token;
};

/**
 * Coordenadas padrão para São Paulo
 */
export const SAO_PAULO_CENTER: [number, number] = [-46.6333, -23.5505];

/**
 * Estilos de mapa disponíveis
 */
export const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

/**
 * Configurações padrão para mapas do Agita
 */
export const DEFAULT_MAP_CONFIG = {
  center: SAO_PAULO_CENTER,
  zoom: 12,
  pitch: 45,
  style: MAP_STYLES.streets,
} as const;

/**
 * Log de configuração do Mapbox (apenas em desenvolvimento)
 */
export const logMapboxConfig = (): void => {
  if (env.development.enableDebugMode) {
    console.group('🗺️ Mapbox Configuration');
    console.log('Token configured:', isMapboxConfigured() ? '✅ Yes' : '❌ No');
    console.log('Token preview:', env.mapbox.accessToken ? `${env.mapbox.accessToken.slice(0, 15)}...` : 'None');
    console.log('Default center:', SAO_PAULO_CENTER);
    console.groupEnd();
  }
}; 