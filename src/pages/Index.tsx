import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MobileBottomNav from "@/components/MobileBottomNav";
import MainMap from "@/components/MainMap";
import SuorOnboardingModal from "@/components/SuorOnboardingModal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Play, 
  Trophy, 
  Target, 
  Zap, 
  MapPin, 
  Route,
  TrendingUp,
  Activity,
  Bell,
  Search,
  Flame,
  Calendar,
  Users
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { useActivityTypes } from '@/hooks/useActivityTypes';
import { useUserStats } from '@/hooks/useUserStats';
import { useProfile } from '@/hooks/useProfile';
import { useSuorOnboarding } from '@/hooks/useSuorOnboarding';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from 'lucide-react';

const Index = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: socialFeed } = useSocialFeed(5);
  const { data: activityTypes } = useActivityTypes();
  const { data: userStats, isLoading: userStatsLoading, error: userStatsError } = useUserStats();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const { showOnboarding, closeOnboarding } = useSuorOnboarding();
  
  // Estado para controlar foco no mapa
  const [focusOnChallenges, setFocusOnChallenges] = useState(false);
  
  // Função para centralizar mapa nos desafios
  const handleFocusChallenges = () => {
    setFocusOnChallenges(true);
    // Reset após um pequeno delay para permitir re-trigger
    setTimeout(() => setFocusOnChallenges(false), 100);
  };



  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/welcome");
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = () => {
    const name = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Compacto */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:bg-white/10 rounded-lg p-1 transition-colors">
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                      <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
                      <AvatarFallback className="bg-white/20 text-white font-semibold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm opacity-90">{getGreeting()}</p>
                      <h1 className="font-semibold">
                        {(profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Atleta').split(' ')[0]}
                      </h1>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 mt-2" align="start" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs">
                          <Zap className="h-3 w-3 text-yellow-500" />
                          <span className="font-medium">{Math.round(profileData?.current_suor || profile?.current_suor || 0)} SUOR</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Trophy className="h-3 w-3 text-blue-500" />
                          <span className="font-medium">Nv. {profile?.level || 1}</span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => navigate('/achievements')}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>Conquistas</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/20 relative">
                <Bell className="h-4 w-4" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span className="font-medium">
                {profileLoading ? '...' : Math.round(profileData?.current_suor || profile?.current_suor || 0)}
              </span>
              <span className="opacity-75">SUOR</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">Nv. {profile?.level || 1}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              <span className="font-medium">{profile?.streak_days || 0}</span>
              <span className="opacity-75">dias</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        {/* Stats Cards */}
        <div className="px-4 py-4 mt-4">
          <div className="grid grid-cols-3 gap-3">
            <Card className="stats-blue border-blue-200 card-hover animate-slide-up cursor-pointer" onClick={() => navigate('/activities')}>
              <CardContent className="p-2.5 text-center">
                <Activity className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-blue-600/70">Atividades</p>
                <p className="text-base font-bold text-blue-700">{userStats?.total_activities || 0}</p>
              </CardContent>
            </Card>
            
            <Card className="stats-yellow border-yellow-200 card-hover animate-slide-up cursor-pointer" style={{ animationDelay: '0.1s' }} onClick={() => navigate('/store')}>
              <CardContent className="p-2.5 text-center">
                <Zap className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                <p className="text-xs text-yellow-600/70">Saldo SUOR</p>
                <p className="text-base font-bold text-yellow-700">
                  {profileLoading ? '...' : Math.round(profileData?.current_suor || profile?.current_suor || 0)}
                </p>
                {!profileLoading && userStats && (
                  <p className="text-xs text-gray-500">
                    {Math.round(userStats.total_suor_earned || 0)} ganhos
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="stats-green border-green-200 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-2.5 text-center">
                <Route className="h-4 w-4 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-green-600/70">Distância</p>
                <p className="text-base font-bold text-green-700">
                  {(userStats?.total_distance_km || 0) < 1 
                    ? `${Math.round((userStats?.total_distance_km || 0) * 1000)}m`
                    : `${(userStats?.total_distance_km || 0).toFixed(1)}km`
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Explore São Paulo</h2>
            <Badge 
              variant="secondary" 
              className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors" 
              onClick={handleFocusChallenges}
            >
              <MapPin className="h-3 w-3 mr-1" />
              3 desafios próximos
            </Badge>
          </div>
          <Card className="overflow-hidden card-hover">
            <div className="h-96 relative">
              <MainMap className="absolute inset-0 h-full w-full" focusOnChallenges={focusOnChallenges} />
              <div className="absolute top-3 right-3">
                <Button size="sm" variant="secondary" className="h-8 glass">
                  <Target className="h-4 w-4 mr-1" />
                  Ver rotas
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Types Section */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Atividades Populares</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {activityTypes?.slice(0, 5).map((type) => (
              <Card 
                key={type.id} 
                className="min-w-[120px] cursor-pointer card-hover"
                onClick={() => navigate('/activity/start')}
              >
                <CardContent className="p-3 text-center">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{type.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {type.base_suor_per_minute} SUOR/min
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>



        {/* Social Feed Preview */}
        {socialFeed && socialFeed.length > 0 && (
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Feed da Comunidade</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                <Users className="h-4 w-4 mr-1" />
                Ver feed
              </Button>
            </div>
            <div className="space-y-3">
              {socialFeed.slice(0, 2).map((post) => (
                <Card key={post.id} className="card-hover animate-slide-up">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold">
                          {post.profiles?.full_name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{post.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {post.type === 'activity' && 'completou uma atividade'}
                          {post.type === 'achievement' && 'desbloqueou uma conquista'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            ❤️ {post.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            💬 {post.comments_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <MobileBottomNav />

      {/* SUOR Onboarding Modal */}
      <SuorOnboardingModal 
        isOpen={showOnboarding} 
        onClose={closeOnboarding} 
      />
    </div>
  );
};

export default Index;