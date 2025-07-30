import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithProvider } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const { user, error } = await signIn(data.email, data.password);
      
      if (error) {
        // Set form errors based on the type of error
        if (error.message.includes('Invalid login credentials')) {
          setError("email", { message: "Email ou senha incorretos" });
          setError("password", { message: "Email ou senha incorretos" });
        } else if (error.message.includes('Email not confirmed')) {
          setError("email", { message: "Email não confirmado. Verifique sua caixa de entrada." });
        } else {
          setError("root", { message: error.message });
        }
        return;
      }

      if (user) {
        // Redirect to the page they were trying to access or home
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("root", { message: "Erro inesperado. Tente novamente." });
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      console.log(`🔐 Login: Iniciando login com ${provider}`);
      await signInWithProvider(provider);
      
      // Show loading feedback
      toast({
        title: `Iniciando login com ${provider}`,
        description: "Você será redirecionado para autorizar o aplicativo...",
      });
      
    } catch (error) {
      console.error(`❌ ${provider} login error:`, error);
      
      toast({
        variant: "destructive",
        title: `Erro no login ${provider}`,
        description: "Não foi possível iniciar o login. Tente novamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/welcome">
            <Button variant="ghost" size="icon" className="rounded-full btn-mobile">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Entrar</h1>
          <div className="w-10" />
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bem-vindo de volta</CardTitle>
            <p className="text-center text-muted-foreground">
              Entre com sua conta para continuar
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Social Login */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 btn-mobile"
                onClick={() => handleSocialLogin("google")}
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 btn-mobile"
                onClick={() => handleSocialLogin("apple")}
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Continuar com Apple
              </Button>

              <Button
                variant="outline"
                className="w-full h-11 btn-mobile"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continuar com Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errors.root && (
                <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded">
                  {errors.root.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className={`pl-10 btn-mobile ${errors.email ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    className={`pl-10 pr-10 btn-mobile ${errors.password ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    {...register("rememberMe")}
                    id="rememberMe" 
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Lembrar de mim
                  </Label>
                </div>
                <Link 
                  to="/onboarding/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci a senha
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 btn-mobile" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-muted-foreground">Não tem uma conta? </span>
              <Link to="/onboarding/signup" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;