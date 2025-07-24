import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait for auth state to be determined
    if (!loading) {
      if (user) {
        // Check if user needs to complete profile setup
        const needsProfileSetup = !user.user_metadata?.profile_completed;
        
        if (needsProfileSetup) {
          // Redirect to profile setup for new OAuth users
          navigate('/onboarding/profile-setup', { replace: true });
        } else {
          // Redirect to main app for existing users
          navigate('/', { replace: true });
        }
      } else {
        // If no user after OAuth callback, something went wrong
        setTimeout(() => {
          navigate('/onboarding/login', { replace: true });
        }, 3000);
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
          </div>
          <p className="text-sm text-muted-foreground">
            Finalizando login...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Erro no login</h1>
            <p className="text-muted-foreground">
              Não foi possível completar o login. Tente novamente.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/onboarding/login')}
            className="w-full"
          >
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full mx-auto flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Login realizado!</h1>
          <p className="text-muted-foreground">
            Redirecionando para o aplicativo...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 