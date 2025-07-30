/**
 * 🔐 Configurações de Environment - Agita
 * 
 * Arquivo centralizado para todas as variáveis de ambiente.
 * Garante tipagem e validação das configurações necessárias.
 */

interface EnvironmentConfig {
  // Supabase
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // Mapbox
  mapbox: {
    accessToken?: string;
  };
  
  // Aplicação
  app: {
    name: string;
    version: string;
    environment: string;
    baseUrl: string;
  };
  
  // Sistema SUOR
  suor: {
    initialBalance: number;
    maxDailyEarned: number;
    streakBonus: number;
  };
  
  // PWA
  pwa: {
    name: string;
    shortName: string;
    description: string;
  };
  
  // Segurança
  security: {
    enableRateLimiting: boolean;
    maxUploadSizeMB: number;
    sessionTimeoutMinutes: number;
  };
  
  // Desenvolvimento
  development: {
    enableDebugMode: boolean;
    showDevTools: boolean;
    enableMockData: boolean;
  };
  
  // APIs externas (futuro)
  external?: {
    googleAnalytics?: string;
    sentry?: string;
    openWeather?: string;
    googlePlaces?: string;
    strava?: {
      clientId: string;
      clientSecret: string;
    };
  };
}

/**
 * Configuração principal do ambiente
 */
export const env: EnvironmentConfig = {
  // 🚀 Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://jjlgmxbgxbcksvviuhmo.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbGdteGJneGJja3N2dml1aG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNzEyODIsImV4cCI6MjA2ODk0NzI4Mn0.bQ5p_0IfeL7aGLkUHsSTiwr_PALHXkMjHpU5CJ2fvRY"
  },
  
  // 🗺️ Mapbox Configuration
  mapbox: {
    accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  },
  
  // 🏃‍♂️ Application Settings
  app: {
    name: import.meta.env.VITE_APP_NAME || "Agita",
    version: import.meta.env.VITE_APP_VERSION || "0.2.0",
    environment: import.meta.env.VITE_APP_ENVIRONMENT || "development",
    baseUrl: import.meta.env.VITE_APP_BASE_URL || "http://localhost:5173"
  },
  
  // 💰 SUOR System Settings
  suor: {
    initialBalance: Number(import.meta.env.VITE_SUOR_INITIAL_BALANCE) || 100,
    maxDailyEarned: Number(import.meta.env.VITE_SUOR_MAX_DAILY_EARNED) || 1000,
    streakBonus: Number(import.meta.env.VITE_SUOR_STREAK_BONUS) || 50
  },
  
  // 📱 PWA Settings
  pwa: {
    name: import.meta.env.VITE_PWA_NAME || "Agita - São Paulo",
    shortName: import.meta.env.VITE_PWA_SHORT_NAME || "Agita",
    description: import.meta.env.VITE_PWA_DESCRIPTION || "Aplicativo gamificado para promover atividades físicas em São Paulo"
  },
  
  // 🔒 Security Settings
  security: {
    enableRateLimiting: import.meta.env.VITE_ENABLE_RATE_LIMITING === 'true',
    maxUploadSizeMB: Number(import.meta.env.VITE_MAX_UPLOAD_SIZE_MB) || 10,
    sessionTimeoutMinutes: Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 60
  },
  
  // 🧪 Development Settings
  development: {
    enableDebugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    showDevTools: import.meta.env.VITE_SHOW_DEV_TOOLS === 'true',
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'
  },
  
  // 🌍 External APIs (opcional)
  external: {
    googleAnalytics: import.meta.env.VITE_GA_TRACKING_ID,
    sentry: import.meta.env.VITE_SENTRY_DSN,
    openWeather: import.meta.env.VITE_OPENWEATHER_API_KEY,
    googlePlaces: import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
    strava: {
      clientId: import.meta.env.VITE_STRAVA_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_STRAVA_CLIENT_SECRET || ''
    }
  }
};

/**
 * Validação das configurações críticas
 */
export const validateEnvironment = (): void => {
  const errors: string[] = [];
  
  // Validar Supabase (obrigatório)
  if (!env.supabase.url) {
    errors.push('VITE_SUPABASE_URL é obrigatório');
  }
  
  if (!env.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY é obrigatório');
  }
  
  // Validar configurações de desenvolvimento
  if (env.app.environment === 'production') {
    if (!env.mapbox.accessToken) {
      console.warn('⚠️  AVISO: VITE_MAPBOX_ACCESS_TOKEN não configurado. Funcionalidades de mapa serão limitadas.');
    }
  }
  
  if (errors.length > 0) {
    throw new Error(`🔴 ERRO DE CONFIGURAÇÃO:\n${errors.join('\n')}\n\nVerifique o arquivo .env.local`);
  }
};

/**
 * Utilitários para verificar ambiente
 */
export const isProduction = env.app.environment === 'production';
export const isDevelopment = env.app.environment === 'development';
export const isDebugMode = env.development.enableDebugMode && isDevelopment;

/**
 * Log das configurações (apenas em desenvolvimento)
 */
if (isDevelopment && isDebugMode) {
  console.group('🔐 Environment Configuration');
  console.log('App:', env.app);
  console.log('Supabase URL:', env.supabase.url);
  console.log('Mapbox Token:', env.mapbox.accessToken ? '✅ Configurado' : '❌ Não configurado');
  console.log('SUOR Settings:', env.suor);
  console.groupEnd();
}

// Executar validação na inicialização
validateEnvironment(); 