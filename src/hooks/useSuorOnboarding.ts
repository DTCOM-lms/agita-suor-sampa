import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useSuorOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!user) {
      setShowOnboarding(false);
      return;
    }

    // Verificar se já completou o onboarding
    const hasCompletedOnboarding = localStorage.getItem('suor-onboarding-completed') === 'true';
    
    // Verificar se é um usuário novo (baseado no perfil)
    const isNewUser = profile && (
      profile.total_activities === 0 || 
      profile.total_suor <= 100 || // Usuários novos começam com 100 SUOR
      !profile.last_activity_date
    );

    // Mostrar onboarding se for usuário novo e ainda não completou
    if (isNewUser && !hasCompletedOnboarding) {
      // Pequeno delay para garantir que a página carregou
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);

      return () => clearTimeout(timer);
    }

    setShowOnboarding(false);
  }, [user, profile]);

  const closeOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('suor-onboarding-completed');
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    closeOnboarding,
    resetOnboarding,
    isNewUser: profile && (profile.total_activities === 0 || profile.total_suor <= 100)
  };
}; 