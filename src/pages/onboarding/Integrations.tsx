import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Smartphone, Watch, Activity, Heart, Zap, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Integrations = () => {
  const navigate = useNavigate();
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAppToggle = (appId: string) => {
    setConnectedApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleFinish = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const integrations = [
    {
      id: "apple-health",
      name: "Apple Health",
      description: "Sincronize dados de saúde e atividades",
      icon: <Heart className="h-6 w-6" />,
      color: "bg-red-500",
      popular: true,
    },
    {
      id: "google-fit",
      name: "Google Fit",
      description: "Importe atividades e métricas de saúde",
      icon: <Activity className="h-6 w-6" />,
      color: "bg-blue-500",
      popular: true,
    },
    {
      id: "strava",
      name: "Strava",
      description: "Conecte suas corridas e ciclismo",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-orange-500",
      popular: true,
    },
    {
      id: "garmin",
      name: "Garmin Connect",
      description: "Sincronize dados do seu relógio Garmin",
      icon: <Watch className="h-6 w-6" />,
      color: "bg-blue-600",
    },
    {
      id: "fitbit",
      name: "Fitbit",
      description: "Importe dados de passos e exercícios",
      icon: <Smartphone className="h-6 w-6" />,
      color: "bg-teal-500",
    },
    {
      id: "polar",
      name: "Polar Flow",
      description: "Conecte seus treinos Polar",
      icon: <Heart className="h-6 w-6" />,
      color: "bg-cyan-500",
    },
    {
      id: "suunto",
      name: "Suunto App",
      description: "Sincronize atividades outdoor",
      icon: <MapPin className="h-6 w-6" />,
      color: "bg-green-600",
    },
    {
      id: "samsung-health",
      name: "Samsung Health",
      description: "Importe dados de saúde Samsung",
      icon: <Activity className="h-6 w-6" />,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/onboarding/profile-setup">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Integrações</h1>
          <div className="w-10" />
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl">Conecte seus apps</CardTitle>
            <p className="text-muted-foreground">
              Importe seus dados existentes e mantenha tudo sincronizado
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {integrations.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center text-white`}>
                    {app.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{app.name}</h3>
                      {app.popular && (
                        <Badge variant="secondary" className="text-xs px-2 py-0">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{app.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {connectedApps.includes(app.id) && (
                    <Check className="h-4 w-4 text-success" />
                  )}
                  <Switch
                    checked={connectedApps.includes(app.id)}
                    onCheckedChange={() => handleAppToggle(app.id)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary */}
        {connectedApps.length > 0 && (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-success">
                <Check className="h-5 w-5" />
                <span className="font-medium">
                  {connectedApps.length} app{connectedApps.length > 1 ? 's' : ''} conectado{connectedApps.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Seus dados serão importados automaticamente
              </p>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleFinish}
          >
            Pular por agora
          </Button>
          <Button
            className="flex-1"
            onClick={handleFinish}
            disabled={isLoading}
          >
            {isLoading ? "Finalizando..." : "Começar"}
            {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Você pode conectar mais apps posteriormente nas configurações
        </p>
      </div>
    </div>
  );
};

export default Integrations;