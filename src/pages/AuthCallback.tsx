import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Check for OAuth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (oauthError) {
      console.error('❌ OAuth Error:', oauthError, errorDescription);
      
      let errorMessage = 'Erro na autenticação social.';
      
      if (oauthError === 'access_denied') {
        errorMessage = 'Acesso negado. Você precisa autorizar o aplicativo para continuar.';
      } else if (errorDescription) {
        errorMessage = errorDescription;
      }
      
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: errorMessage,
      });
      
      return;
    }

    // Wait for auth state to be determined
    if (!loading) {
      console.log('📍 AuthCallback: loading=false, user=', !!user);
      
      if (user) {
        console.log('✅ AuthCallback: Usuário autenticado, redirecionando...');
        
        // Check if user needs to complete profile setup
        const needsProfileSetup = !user.user_metadata?.profile_completed;
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando...",
        });
        
        setTimeout(() => {
          if (needsProfileSetup) {
            // Redirect to profile setup for new OAuth users
            navigate('/onboarding/profile-setup', { replace: true });
          } else {
            // Redirect to main app for existing users
            navigate('/', { replace: true });
          }
        }, 1500);
        
      } else {
        console.log('❌ AuthCallback: Nenhum usuário encontrado após callback');
        // If no user after OAuth callback, something went wrong
        setError('Não foi possível completar o login. Tente novamente.');
        
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: "Não foi possível completar o login.",
        });
      }
    }
  }, [user, loading, navigate, toast]);

  // Countdown timer for error state
  useEffect(() => {
    if (error && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (error && countdown === 0) {
      navigate('/onboarding/login', { replace: true });
    }
  }, [error, countdown, navigate]);

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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full mx-auto flex items-center justify-center">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Erro no login</h1>
            <p className="text-muted-foreground">
              {error}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando em {countdown} segundos...
            </p>
          </div>
          <Button 
            onClick={() => navigate('/onboarding/login')}
            className="w-full"
          >
            Voltar ao Login Agora
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state when not authenticated but no error
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full mx-auto flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Processando login...</h1>
            <p className="text-muted-foreground">
              Aguarde enquanto verificamos sua autenticação.
            </p>
          </div>
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