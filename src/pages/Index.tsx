import { useAuth } from '@/contexts/AuthContext';
import Header from "@/components/Header";
import MobileBottomNav from "@/components/MobileBottomNav";
import MainMap from "@/components/MainMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trophy, Target, Zap } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();



  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      {/* Área do mapa */}
      <main className="flex-1 relative" style={{ minHeight: '400px' }}>
        <MainMap className="absolute inset-0 h-full w-full" />
      </main>

      {/* Card de boas-vindas */}
      <Card className="mx-4 my-4 bg-white/95 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">
                Olá, {profile?.full_name?.split(' ')[0] || 'Atleta'}! 👋
              </h1>
              <p className="text-sm text-muted-foreground">
                {Math.round(profile?.current_suor || 0)} SUOR disponíveis
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/activity/start')}>
              <Play className="mr-2 h-4 w-4" />
              Ativar
            </Button>
          </div>
        </CardContent>
      </Card>

      <MobileBottomNav />
    </div>
  );
};

export default Index;