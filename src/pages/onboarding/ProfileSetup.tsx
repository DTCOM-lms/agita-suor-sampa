import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Camera, ArrowLeft, ArrowRight, Upload, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileStep1Schema, type ProfileStep1Input } from "@/lib/validations";
import { useAuth } from "@/contexts/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { uploadImage, uploading, uploadProgress } = useImageUpload({ bucket: 'avatars' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.user_metadata?.avatar_url || "");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    setError,
  } = useForm<ProfileStep1Input>({
    resolver: zodResolver(profileStep1Schema),
    defaultValues: {
      displayName: user?.user_metadata?.full_name || "",
      bio: user?.user_metadata?.bio || "",
      avatarUrl: user?.user_metadata?.avatar_url || "",
    },
  });

  const watchDisplayName = watch("displayName");
  const watchBio = watch("bio");

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      const uploadedUrl = await uploadImage(file, user.id);
      if (uploadedUrl) {
        setAvatarUrl(uploadedUrl);
        setValue("avatarUrl", uploadedUrl);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save profile and go to integrations
      const formData = {
        displayName: watchDisplayName,
        bio: watchBio,
        avatarUrl: avatarUrl,
      };

      try {
        const { error } = await updateProfile({
          full_name: formData.displayName,
          bio: formData.bio,
          avatar_url: formData.avatarUrl,
          profile_completed: true,
        });

        if (error) {
          setError("root", { message: error.message });
          return;
        }

        navigate("/onboarding/integrations");
      } catch (error) {
        console.error('Profile update error:', error);
        setError("root", { message: "Erro ao salvar perfil. Tente novamente." });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ProfileStep1Input) => {
    // This handles the form submission for step 1
    handleNext();
  };

  const removeAvatar = () => {
    setAvatarUrl("");
    setValue("avatarUrl", "");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="text-sm text-destructive text-center p-2 bg-destructive/10 rounded">
                {errors.root.message}
              </div>
            )}

            <div className="text-center space-y-4">
              <div className="relative mx-auto w-24 h-24">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {watchDisplayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '👤'}
                  </AvatarFallback>
                </Avatar>
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="text-white text-xs">
                      {uploadProgress}%
                    </div>
                  </div>
                )}

                <div className="absolute -bottom-1 -right-1 flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    className="rounded-full w-8 h-8 bg-primary"
                    onClick={handleAvatarClick}
                    disabled={uploading}
                  >
                    {uploading ? <Upload className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                  </Button>
                  
                  {avatarUrl && (
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="rounded-full w-8 h-8"
                      onClick={removeAvatar}
                      disabled={uploading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold">Adicione uma foto</h2>
                <p className="text-muted-foreground">Personalize seu perfil com uma foto</p>
                {uploading && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de exibição</Label>
                <Input
                  {...register("displayName")}
                  id="displayName"
                  placeholder="Como você gostaria de ser chamado?"
                  className={`btn-mobile ${errors.displayName ? 'border-destructive' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.displayName && (
                  <p className="text-sm text-destructive">{errors.displayName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (opcional)</Label>
                <Input
                  {...register("bio")}
                  id="bio"
                  placeholder="Conte um pouco sobre você..."
                  maxLength={150}
                  className="btn-mobile"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {watchBio?.length || 0}/150 caracteres
                </p>
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Informações básicas</h2>
                <p className="text-muted-foreground">Nos ajude a personalizar sua experiência</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data de nascimento</Label>
                <Input type="date" className="btn-mobile" />
              </div>

              <div className="space-y-2">
                <Label>Gênero</Label>
                <Select>
                  <SelectTrigger className="btn-mobile">
                    <SelectValue placeholder="Selecione seu gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input type="number" placeholder="170" className="btn-mobile" />
                </div>
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input type="number" placeholder="70" className="btn-mobile" />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent/10 rounded-full mx-auto flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Seus objetivos</h2>
                <p className="text-muted-foreground">O que você espera alcançar?</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nível de condicionamento</Label>
                <Select>
                  <SelectTrigger className="btn-mobile">
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Objetivos principais</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "weight_loss", label: "Perder peso" },
                    { id: "muscle_gain", label: "Ganhar massa muscular" },
                    { id: "endurance", label: "Melhorar resistência" },
                    { id: "general_health", label: "Saúde geral" }
                  ].map((goal) => (
                    <label key={goal.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <input type="checkbox" className="rounded" />
                      <span>{goal.label}</span>
                    </label>
                  ))}
                </div>
              </div>
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
            className="rounded-full btn-mobile"
            onClick={currentStep === 1 ? () => navigate("/onboarding/signup") : handleBack}
            disabled={uploading}
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
        <div className="flex gap-4">
          {currentStep > 1 && (
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex-1 btn-mobile"
              disabled={uploading || isSubmitting}
            >
              Voltar
            </Button>
          )}
          
          <Button 
            onClick={currentStep === 1 ? handleSubmit(onSubmit) : handleNext}
            className="flex-1 btn-mobile"
            disabled={uploading || isSubmitting}
          >
            {uploading ? "Enviando..." : isSubmitting ? "Salvando..." : currentStep === 3 ? "Finalizar" : "Continuar"}
            {!uploading && !isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;