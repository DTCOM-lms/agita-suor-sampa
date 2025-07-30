import { Bell, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Agita
            </div>
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              São Paulo
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/search')}
              className="h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 relative"
            >
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/settings')}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;