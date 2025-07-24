import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        if (error.message.includes('User not found')) {
          setError("email", { message: "Nenhuma conta encontrada com este email." });
        } else {
          setError("root", { message: error.message });
        }
        return;
      }

      setEmailSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError("root", { message: "Erro inesperado. Tente novamente." });
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link to="/onboarding/login">
              <Button variant="ghost" size="icon" className="rounded-full btn-mobile">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Email Enviado</h1>
            <div className="w-10" />
          </div>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-success/10 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">Email enviado!</CardTitle>
              <p className="text-muted-foreground">
                Enviamos um link para redefinir sua senha para{" "}
                <span className="font-medium text-foreground">{getValues("email")}</span>
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Não encontrou o email? Verifique sua pasta de spam ou aguarde alguns minutos.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => setEmailSent(false)}
                    variant="outline" 
                    className="w-full btn-mobile"
                  >
                    Tentar outro email
                  </Button>
                  
                  <Link to="/onboarding/login" className="w-full block">
                    <Button className="w-full btn-mobile">
                      Voltar ao Login
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/onboarding/login">
            <Button variant="ghost" size="icon" className="rounded-full btn-mobile">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Esqueci a Senha</h1>
          <div className="w-10" />
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Redefinir senha</CardTitle>
            <p className="text-center text-muted-foreground">
              Digite seu email e enviaremos um link para redefinir sua senha
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              <Button 
                type="submit" 
                className="w-full h-11 btn-mobile" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar link de redefinição"}
              </Button>

              <div className="text-center">
                <span className="text-muted-foreground">Lembrou da sua senha? </span>
                <Link to="/onboarding/login" className="text-primary hover:underline">
                  Voltar ao login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;