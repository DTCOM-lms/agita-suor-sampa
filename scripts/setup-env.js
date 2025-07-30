#!/usr/bin/env node

/**
 * 🔐 Agita - Setup de Environment Variables
 * 
 * Script para configurar automaticamente as variáveis de ambiente
 * necessárias para o projeto Agita.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envFilePath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'environment.example');

console.log('🚀 Bem-vindo ao setup do Agita!');
console.log('Este script irá ajudá-lo a configurar as variáveis de ambiente necessárias.\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  try {
    // Verificar se já existe .env.local
    if (fs.existsSync(envFilePath)) {
      console.log('⚠️  Arquivo .env.local já existe!');
      const overwrite = await question('Deseja sobrescrever? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Setup cancelado.');
        rl.close();
        return;
      }
    }

    console.log('\n📋 Vamos configurar suas variáveis de ambiente:\n');

    // Configurações básicas
    console.log('🚀 CONFIGURAÇÕES SUPABASE');
    console.log('Obtenha suas chaves em: https://supabase.com/dashboard/project/[seu-projeto]/settings/api\n');
    
    const supabaseUrl = await question('URL do Supabase (padrão: https://jjlgmxbgxbcksvviuhmo.supabase.co): ');
    const supabaseKey = await question('Chave Anon do Supabase: ');

    console.log('\n🗺️  CONFIGURAÇÕES MAPBOX (OPCIONAL)');
    console.log('Obtenha sua chave gratuita em: https://account.mapbox.com/access-tokens/\n');
    
    const mapboxToken = await question('Token do Mapbox (deixe vazio para pular): ');

    console.log('\n🏃‍♂️ CONFIGURAÇÕES DA APLICAÇÃO');
    const appName = await question('Nome da aplicação (padrão: Agita): ') || 'Agita';
    const appVersion = await question('Versão (padrão: 0.2.0): ') || '0.2.0';
    const environment = await question('Ambiente (development/staging/production) [padrão: development]: ') || 'development';

    console.log('\n💰 CONFIGURAÇÕES DO SISTEMA SUOR');
    const initialBalance = await question('Saldo inicial SUOR (padrão: 100): ') || '100';
    const maxDaily = await question('SUOR máximo por dia (padrão: 1000): ') || '1000';
    const streakBonus = await question('Bônus de sequência (padrão: 50): ') || '50';

    // Gerar arquivo .env.local
    const envContent = `# 🔐 Agita - Configurações de Environment
# Gerado automaticamente pelo script de setup

# ====================================
# 🚀 SUPABASE CONFIGURATION
# ====================================
VITE_SUPABASE_URL=${supabaseUrl || 'https://jjlgmxbgxbcksvviuhmo.supabase.co'}
VITE_SUPABASE_ANON_KEY=${supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbGdteGJneGJja3N2dml1aG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNzEyODIsImV4cCI6MjA2ODk0NzI4Mn0.bQ5p_0IfeL7aGLkUHsSTiwr_PALHXkMjHpU5CJ2fvRY'}

# ====================================
# 🗺️ MAPBOX CONFIGURATION
# ====================================
${mapboxToken ? `VITE_MAPBOX_ACCESS_TOKEN=${mapboxToken}` : '# VITE_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here'}

# ====================================
# 🏃‍♂️ APPLICATION SETTINGS
# ====================================
VITE_APP_NAME=${appName}
VITE_APP_VERSION=${appVersion}
VITE_APP_ENVIRONMENT=${environment}
VITE_APP_BASE_URL=http://localhost:5173

# ====================================
# 💰 SUOR SYSTEM SETTINGS
# ====================================
VITE_SUOR_INITIAL_BALANCE=${initialBalance}
VITE_SUOR_MAX_DAILY_EARNED=${maxDaily}
VITE_SUOR_STREAK_BONUS=${streakBonus}

# ====================================
# 📱 PWA SETTINGS
# ====================================
VITE_PWA_NAME=Agita - São Paulo
VITE_PWA_SHORT_NAME=Agita
VITE_PWA_DESCRIPTION=Aplicativo gamificado para promover atividades físicas em São Paulo

# ====================================
# 🔒 SECURITY SETTINGS
# ====================================
VITE_ENABLE_RATE_LIMITING=true
VITE_MAX_UPLOAD_SIZE_MB=10
VITE_SESSION_TIMEOUT_MINUTES=60

# ====================================
# 🧪 DEVELOPMENT SETTINGS
# ====================================
VITE_ENABLE_DEBUG_MODE=${environment === 'development' ? 'true' : 'false'}
VITE_SHOW_DEV_TOOLS=${environment === 'development' ? 'true' : 'false'}
VITE_ENABLE_MOCK_DATA=false

# ====================================
# 🌍 EXTERNAL APIS (OPCIONAL)
# ====================================
# VITE_GA_TRACKING_ID=G-XXXXXXXXXX
# VITE_SENTRY_DSN=https://your-sentry-dsn-here
# VITE_OPENWEATHER_API_KEY=your_weather_api_key_here
# VITE_GOOGLE_PLACES_API_KEY=your_google_places_key_here
# VITE_STRAVA_CLIENT_ID=your_strava_client_id
# VITE_STRAVA_CLIENT_SECRET=your_strava_client_secret
`;

    fs.writeFileSync(envFilePath, envContent);

    console.log('\n✅ Arquivo .env.local criado com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Verifique o arquivo .env.local criado');
    console.log('2. Configure as chaves do Supabase se necessário');
    console.log('3. Adicione o token do Mapbox para funcionalidades de mapa');
    console.log('4. Execute: npm run dev ou bun dev');
    
    if (!supabaseKey) {
      console.log('\n⚠️  IMPORTANTE: Configure a chave do Supabase no arquivo .env.local antes de executar o projeto!');
    }
    
    if (!mapboxToken) {
      console.log('\n💡 DICA: Para usar mapas, adicione o token do Mapbox no arquivo .env.local');
    }

  } catch (error) {
    console.error('❌ Erro durante o setup:', error.message);
  } finally {
    rl.close();
  }
}

// Executar setup
setupEnvironment(); 