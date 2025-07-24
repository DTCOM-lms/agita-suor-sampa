import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Trophy, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-2xl mx-auto flex items-center justify-center">
            <Play className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Bem-vindo ao Agita</h1>
            <p className="text-muted-foreground">
              Sua jornada fitness começa aqui. Conecte-se, compita e conquiste seus objetivos.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Conquiste Desafios</h3>
                <p className="text-sm text-muted-foreground">Participe de desafios e ganhe recompensas</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Conecte-se</h3>
                <p className="text-sm text-muted-foreground">Faça parte de uma comunidade ativa</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">Acompanhe Progresso</h3>
                <p className="text-sm text-muted-foreground">Monitore suas atividades em tempo real</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link to="/onboarding/signup" className="w-full">
            <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90">
              Começar Agora
            </Button>
          </Link>
          
          <Link to="/onboarding/login" className="w-full">
            <Button variant="outline" className="w-full h-12 text-base">
              Já tenho uma conta
            </Button>
          </Link>
        </div>

        {/* Terms */}
        <p className="text-xs text-center text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <Link to="/terms" className="text-primary underline">
            Termos de Uso
          </Link>{" "}
          e{" "}
          <Link to="/privacy" className="text-primary underline">
            Política de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Welcome;