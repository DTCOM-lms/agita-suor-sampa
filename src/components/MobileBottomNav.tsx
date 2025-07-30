import { Home, Activity, Trophy, Users, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      icon: Home,
      label: "Início",
      path: "/",
      isActive: location.pathname === "/",
      badge: null
    },
    {
      icon: Trophy,
      label: "Conquistas",
      path: "/achievements",
      isActive: location.pathname === "/achievements",
      badge: null
    },
    // Espaço para o FAB central
    null,
    {
      icon: Users,
      label: "Social",
      path: "/social",
      isActive: location.pathname === "/social",
      badge: 3 // Exemplo: 3 novas interações
    },
    {
      icon: Activity,
      label: "Atividades",
      path: "/activities",
      isActive: location.pathname.startsWith("/activities"),
      badge: null
    }
  ];

  const handleNavigation = (path: string) => {
    if (path.startsWith("#")) {
      // Para âncoras, fazer scroll suave na página
      const section = document.querySelector(path.replace("#", "[data-section='") + "']");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background with gradient and blur */}
      <div className="bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-lg border-t border-border/50">
        <div className="relative px-4 py-2 pb-safe">
          <div className="flex items-center justify-around">
            {navItems.map((item, index) => {
              // FAB central no meio
              if (item === null) {
                return (
                  <div key="fab" className="relative">
                    <Button
                      size="lg"
                      onClick={() => navigate('/activity/start')}
                      className="h-14 w-14 rounded-full gradient-animation fab-scale shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-6 w-6 text-white" />
                    </Button>
                    {/* Pulse effect */}
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  </div>
                );
              }

              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[64px]",
                    "touch-manipulation select-none",
                    item.isActive
                      ? "text-primary bg-primary/10 scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                  )}
                >
                  <div className="relative">
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-300",
                      item.isActive ? "scale-110 drop-shadow-sm" : "scale-100"
                    )} />
                    
                    {/* Badge de notificação */}
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold nav-badge"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-xs font-medium transition-all duration-300",
                    item.isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {item.isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>


    </nav>
  );
};

export default MobileBottomNav; 