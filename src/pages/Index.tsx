import { 
  Activity, 
  Target, 
  Users, 
  Trophy, 
  MapPin, 
  Play, 
  TrendingUp,
  Heart,
  Zap,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ActivityCard from "@/components/ActivityCard";
import StatsCard from "@/components/StatsCard";
import ChallengeCard from "@/components/ChallengeCard";
import SocialFeed from "@/components/SocialFeed";
import heroImage from "@/assets/hero-agita.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="h-[60vh] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-secondary/80 to-accent/90"></div>
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white animate-slide-up">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Mova-se por <span className="text-yellow-300">São Paulo</span>
              </h1>
              <p className="text-xl mb-8 text-white/90">
                Transforme suas atividades físicas em recompensas reais. 
                Ganhe SUOR fazendo exercícios e resgate benefícios incríveis na cidade!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                  <Play className="mr-2 h-5 w-5" />
                  Começar Agora
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <MapPin className="mr-2 h-5 w-5" />
                  Explorar Atividades
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Stats Overview */}
        <section className="animate-slide-up">
          <h2 className="text-3xl font-bold mb-8">Seu Progresso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="SUOR Total"
              value="1,250"
              change="+180 esta semana"
              icon={<Trophy className="h-5 w-5 text-primary" />}
              trend="up"
            />
            <StatsCard
              title="Atividades"
              value="23"
              change="+5 este mês"
              icon={<Activity className="h-5 w-5 text-secondary" />}
              trend="up"
            />
            <StatsCard
              title="Ranking"
              value="#127"
              change="Subiu 15 posições"
              icon={<Target className="h-5 w-5 text-accent" />}
              trend="up"
            />
            <StatsCard
              title="Amigos"
              value="34"
              change="+3 novos"
              icon={<Users className="h-5 w-5 text-success" />}
              trend="up"
            />
          </div>
        </section>

        {/* Quick Activities */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Atividades Rápidas</h2>
            <Button variant="outline">Ver Todas</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActivityCard
              title="Corrida Matinal"
              description="Comece o dia com energia no Parque Ibirapuera"
              icon={<Activity className="h-6 w-6 text-primary" />}
              suorReward={150}
              difficulty="Médio"
              location="Parque Ibirapuera"
              duration="30-45 min"
            />
            <ActivityCard
              title="Pedalada Urbana"
              description="Explore as ciclovias de São Paulo"
              icon={<Zap className="h-6 w-6 text-secondary" />}
              suorReward={200}
              difficulty="Fácil"
              location="Ciclovia Marginal"
              duration="60 min"
            />
            <ActivityCard
              title="Yoga ao Ar Livre"
              description="Relaxe e se exercite no Villa-Lobos"
              icon={<Heart className="h-6 w-6 text-accent" />}
              suorReward={100}
              difficulty="Fácil"
              location="Parque Villa-Lobos"
              duration="45 min"
            />
          </div>
        </section>

        {/* Challenges */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Desafios Ativos</h2>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Ver Calendário
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChallengeCard
              title="SP Ativa - Março"
              description="Participe do desafio municipal! Complete 100km em atividades físicas durante o mês."
              progress={65}
              participants={15420}
              timeLeft="12 dias restantes"
              reward={500}
              type="coletivo"
              isActive={true}
            />
            <ChallengeCard
              title="Corredor Consistente"
              description="Corra pelo menos 3x por semana durante um mês inteiro."
              progress={80}
              participants={234}
              timeLeft="8 dias restantes"
              reward={300}
              type="individual"
            />
          </div>
        </section>

        {/* Social Feed */}
        <section>
          <SocialFeed />
        </section>
      </main>
    </div>
  );
};

export default Index;
