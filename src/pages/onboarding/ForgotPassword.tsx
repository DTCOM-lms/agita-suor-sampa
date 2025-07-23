import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate email sending
    setTimeout(() => {
      setIsLoading(false);
      setEmailSent(true);
    }, 1500);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm text-center">
            <CardContent className="pt-6 space-y-4">
              <div className="w-16 h-16 bg-success/10 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">E-mail enviado!</h2>
                <p className="text-muted-foreground">
                  Enviamos um link de recuperação para <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Verifique sua caixa de entrada e spam. O link expira em 24 horas.
                </p>
              </div>
              <div className="space-y-3 pt-4">
                <Link to="/onboarding/login" className="w-full">
                  <Button className="w-full">Voltar ao Login</Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Enviar novamente
                </Button>
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
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Recuperar Senha</h1>
          <div className="w-10" />
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Esqueceu sua senha?</CardTitle>
            <p className="text-center text-muted-foreground">
              Digite seu e-mail e enviaremos um link para redefinir sua senha
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-muted-foreground">Lembrou da senha? </span>
              <Link to="/onboarding/login" className="text-primary hover:underline">
                Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;