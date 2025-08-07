import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Coins, 
  Trophy, 
  Zap, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Gift,
  Users,
  Target
} from "lucide-react";

interface SuorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuorOnboardingModal = ({ isOpen, onClose }: SuorOnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    {
      title: "Bem-vindo ao Agita! 👋",
      subtitle: "Conheça o SUOR, sua moeda de recompensa",
      icon: <Coins className="h-12 w-12 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            O <strong>SUOR</strong> é sua moeda virtual que você ganha fazendo atividades físicas e completando desafios.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="flex items-center space-x-2 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-2 rounded-lg">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-700 dark:text-yellow-300">100 SUOR</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Como Ganhar SUOR 🏃‍♂️",
      subtitle: "Atividades que geram recompensas",
      icon: <Zap className="h-12 w-12 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">Atividades ao ar livre</p>
                <p className="text-sm text-muted-foreground">Corrida, caminhada, ciclismo</p>
              </div>
              <Badge variant="secondary">+50 SUOR</Badge>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">Atividades indoor</p>
                <p className="text-sm text-muted-foreground">Academia, yoga, pilates</p>
              </div>
              <Badge variant="secondary">+30 SUOR</Badge>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium">Conquistas e desafios</p>
                <p className="text-sm text-muted-foreground">Metas diárias e semanais</p>
              </div>
              <Badge variant="secondary">+100 SUOR</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Como gastar SUOR 🛍️",
      subtitle: "Recompensas reais esperando por você",
      icon: <Gift className="h-12 w-12 text-pink-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            Use seus SUOR para resgatar recompensas incríveis de nossos parceiros pelo app Agita.
          </p>
          <div className="grid gap-3">
            <div className="flex items-center space-x-3 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg">
              <Target className="h-5 w-5 text-pink-600" />
              <div className="flex-1">
                <p className="font-medium">Descontos em academias</p>
                <p className="text-sm text-muted-foreground">Até 50% de desconto</p>
              </div>
              <Badge variant="outline">500 SUOR</Badge>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <Star className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium">Produtos fitness</p>
                <p className="text-sm text-muted-foreground">Suplementos e equipamentos</p>
              </div>
              <Badge variant="outline">300 SUOR</Badge>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600" />
              <div className="flex-1">
                <p className="font-medium">Experiências exclusivas</p>
                <p className="text-sm text-muted-foreground">Eventos e workshops</p>
              </div>
              <Badge variant="outline">1000 SUOR</Badge>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pronto para Começar! 🚀",
      subtitle: "Sua jornada no Agita começa agora",
      icon: <Play className="h-12 w-12 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            Agora você sabe como funciona o <strong>SUOR</strong> no Agita! Comece sua primeira atividade e veja seus pontos crescerem.
          </p>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium">Dica Pro</p>
                <p className="text-sm text-muted-foreground">
                  Mantenha uma sequência de atividades para ganhar bônus extras!
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setProgress(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setProgress(((currentStep + 1) / steps.length) * 100);
  }, [currentStep, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Marcar como visto no localStorage
    localStorage.setItem('suor-onboarding-completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-auto bg-background/95 backdrop-blur-sm border-border/50 shadow-2xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-sm text-muted-foreground">
                {currentStep + 1} de {steps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="mb-6" />

          {/* Content */}
          <div className="text-center space-y-4 mb-6">
            {/* Icon */}
            <div className="flex justify-center">
              {currentStepData.icon}
            </div>

            {/* Title */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Content */}
            <div className="mt-4">
              {currentStepData.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            <Button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90"
            >
              <span>{isLastStep ? 'Começar!' : 'Próximo'}</span>
              {isLastStep ? (
                <Play className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Skip Link */}
          {!isLastStep && (
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Pular tutorial
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuorOnboardingModal; 