import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsLoading(true);
      setTimeout(() => {
        navigate("/onboarding/integrations");
      }, 1000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-primary/10">👤</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 rounded-full w-8 h-8"
                  variant="secondary"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Adicione uma foto</h2>
                <p className="text-muted-foreground">Personalize seu perfil com uma foto</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de exibição</Label>
                <Input
                  id="displayName"
                  placeholder="Como você gostaria de ser chamado?"
                  defaultValue="João Silva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (opcional)</Label>
                <Input
                  id="bio"
                  placeholder="Conte um pouco sobre você..."
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground">0/150 caracteres</p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Informações pessoais</h2>
              <p className="text-muted-foreground">Ajude-nos a personalizar sua experiência</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input id="age" type="number" placeholder="25" min="13" max="120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input id="weight" type="number" placeholder="70" min="30" max="300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input id="height" type="number" placeholder="175" min="100" max="250" />
                </div>
                <div className="space-y-2">
                  <Label>Gênero</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefiro não dizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nível de atividade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                    <SelectItem value="athlete">Atleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Seus objetivos</h2>
              <p className="text-muted-foreground">O que você quer alcançar?</p>
            </div>

            <div className="space-y-3">
              {[
                { id: "weight-loss", label: "Perder peso", emoji: "⚖️" },
                { id: "muscle-gain", label: "Ganhar músculo", emoji: "💪" },
                { id: "endurance", label: "Melhorar resistência", emoji: "🏃" },
                { id: "health", label: "Melhorar saúde geral", emoji: "❤️" },
                { id: "performance", label: "Performance esportiva", emoji: "🏆" },
                { id: "habit", label: "Criar hábitos saudáveis", emoji: "✅" },
              ].map((goal) => (
                <label
                  key={goal.id}
                  className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                >
                  <input type="checkbox" className="rounded" />
                  <span className="text-2xl">{goal.emoji}</span>
                  <span className="font-medium">{goal.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Meta específica (opcional)</Label>
              <Input
                id="target"
                placeholder="Ex: Correr 5km em menos de 25 minutos"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={currentStep === 1 ? () => navigate("/onboarding/signup") : handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Configurar Perfil</h1>
          <div className="w-10" />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Passo {currentStep} de 3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="sr-only">Configuração do Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/onboarding/integrations")}
          >
            Pular
          </Button>
          <Button
            className="flex-1"
            onClick={handleNext}
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : currentStep === 3 ? "Finalizar" : "Próximo"}
            {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;