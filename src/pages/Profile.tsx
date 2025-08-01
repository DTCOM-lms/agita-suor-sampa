import React, { useState } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Camera, 
  Save, 
  Mail, 
  Calendar, 
  MapPin, 
  Ruler, 
  Weight, 
  Dumbbell,
  Shield,
  Bell,
  Zap,
  Trophy,
  Activity,
  Target,
  Flame,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadImage = useImageUpload();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    birth_date: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    fitness_level: '',
    city: '',
    neighborhood: '',
    is_public: true,
    allow_friend_requests: true,
  });

  // Atualizar formData quando profile carrega
  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        birth_date: profile.birth_date ? profile.birth_date.split('T')[0] : '',
        gender: profile.gender || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        fitness_level: profile.fitness_level || 'beginner',
        city: profile.city || 'São Paulo',
        neighborhood: profile.neighborhood || '',
        is_public: profile.is_public ?? true,
        allow_friend_requests: profile.allow_friend_requests ?? true,
      });
    }
  }, [profile, isEditing]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      const avatarUrl = await uploadImage.mutateAsync({
        file,
        bucket: 'avatars',
        path: `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`
      });
      
      if (avatarUrl) {
        await updateProfile.mutateAsync({ avatar_url: avatarUrl });
      }
    } catch (error) {
      // Error already handled in the hook's onError
      console.error('Error uploading avatar:', error);
    }
  };

  const handleSave = async () => {
    try {
      const updateData: any = {
        username: formData.username || null,
        full_name: formData.full_name,
        bio: formData.bio || null,
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        fitness_level: formData.fitness_level,
        city: formData.city,
        neighborhood: formData.neighborhood || null,
        is_public: formData.is_public,
        allow_friend_requests: formData.allow_friend_requests,
      };

      await updateProfile.mutateAsync(updateData);
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        birth_date: profile.birth_date ? profile.birth_date.split('T')[0] : '',
        gender: profile.gender || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        fitness_level: profile.fitness_level || 'beginner',
        city: profile.city || 'São Paulo',
        neighborhood: profile.neighborhood || '',
        is_public: profile.is_public ?? true,
        allow_friend_requests: profile.allow_friend_requests ?? true,
      });
    }
    setIsEditing(false);
  };

  const getUserInitials = () => {
    const name = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFitnessLevelLabel = (level: string) => {
    const levels = {
      beginner: 'Iniciante',
      intermediate: 'Intermediário',
      advanced: 'Avançado',
      expert: 'Expert'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getGenderLabel = (gender: string) => {
    const genders = {
      male: 'Masculino',
      female: 'Feminino',
      other: 'Outro',
      prefer_not_to_say: 'Prefiro não dizer'
    };
    return genders[gender as keyof typeof genders] || gender;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-24">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-24">
          <Card className="card-agita">
            <CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Perfil não encontrado</h3>
              <p className="text-muted-foreground">
                Não foi possível carregar as informações do perfil.
              </p>
            </CardContent>
          </Card>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-24 space-y-6">
        {/* Header do Perfil */}
        <Card className="card-agita">
          <CardContent className="p-6">
            {/* Layout Desktop e Tablet */}
            <div className="hidden sm:flex items-start gap-6">
              <div className="relative flex-shrink-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
                  <AvatarFallback className="text-xl font-bold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer group hover:bg-black/60 transition-colors">
                    <Camera className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="mb-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold truncate">{profile.full_name}</h1>
                    {profile.username && (
                      <p className="text-muted-foreground text-sm">@{profile.username}</p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Estatísticas Rápidas Desktop */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                      <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nível {profile.level}</p>
                      <p className="text-xs text-muted-foreground">{profile.experience_points} XP</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{Math.round(profile.current_suor)} SUOR</p>
                      <p className="text-xs text-muted-foreground">Saldo atual</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20">
                      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{profile.total_activities}</p>
                      <p className="text-xs text-muted-foreground">Atividades</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Mobile */}
            <div className="sm:hidden space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
                    <AvatarFallback className="text-sm font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer group hover:bg-black/60 transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold truncate">{profile.full_name}</h1>
                  {profile.username && (
                    <p className="text-muted-foreground text-sm">@{profile.username}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              {/* Estatísticas Mobile - Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold">Nv. {profile.level}</p>
                  <p className="text-xs text-muted-foreground">{profile.experience_points} XP</p>
                </div>
                
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-sm font-semibold">{Math.round(profile.current_suor)}</p>
                  <p className="text-xs text-muted-foreground">SUOR</p>
                </div>
                
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold">{profile.total_activities}</p>
                  <p className="text-xs text-muted-foreground">Atividades</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo em Abas */}
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Aba Informações */}
          <TabsContent value="info" className="space-y-4">
            <Card className="card-agita">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Botões de Edição */}
                <div className="flex justify-end border-b pb-4 mb-6">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      <User className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={updateProfile.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfile.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="@usuario"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="full_name">Nome completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Seu nome completo"
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birth_date">Data de nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleInputChange('birth_date', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="gender">Gênero</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefiro não dizer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="height_cm">Altura (cm)</Label>
                    <Input
                      id="height_cm"
                      type="number"
                      value={formData.height_cm}
                      onChange={(e) => handleInputChange('height_cm', e.target.value)}
                      placeholder="170"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="weight_kg">Peso (kg)</Label>
                    <Input
                      id="weight_kg"
                      type="number"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                      placeholder="70.0"
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="fitness_level">Nível de condicionamento</Label>
                    <Select
                      value={formData.fitness_level}
                      onValueChange={(value) => handleInputChange('fitness_level', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Iniciante</SelectItem>
                        <SelectItem value="intermediate">Intermediário</SelectItem>
                        <SelectItem value="advanced">Avançado</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="São Paulo"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      placeholder="Vila Madalena"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Estatísticas */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="card-agita">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Gamificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Nível Atual</span>
                    <Badge variant="outline" className="font-bold">
                      {profile.level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Experiência</span>
                    <span className="font-medium">{profile.experience_points} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SUOR Total Ganho</span>
                    <span className="font-medium">{Math.round(profile.total_suor)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Saldo Atual</span>
                    <span className="font-medium text-primary">{Math.round(profile.current_suor)} SUOR</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-agita">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total de Atividades</span>
                    <span className="font-medium">{profile.total_activities}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Distância Total</span>
                    <span className="font-medium">{profile.total_distance_km.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tempo Total</span>
                    <span className="font-medium">{Math.round(profile.total_duration_minutes / 60)} horas</span>
                  </div>
                  {profile.last_activity_date && (
                    <div className="flex items-center justify-between">
                      <span>Última Atividade</span>
                      <span className="font-medium">
                        {format(new Date(profile.last_activity_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="card-agita">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Sequências
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Sequência Atual</span>
                    <span className="font-medium">{profile.streak_days} dias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Maior Sequência</span>
                    <span className="font-medium">{profile.longest_streak} dias</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-agita">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Informações Físicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.height_cm && (
                    <div className="flex items-center justify-between">
                      <span>Altura</span>
                      <span className="font-medium">{profile.height_cm} cm</span>
                    </div>
                  )}
                  {profile.weight_kg && (
                    <div className="flex items-center justify-between">
                      <span>Peso</span>
                      <span className="font-medium">{profile.weight_kg} kg</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span>Nível de Condicionamento</span>
                    <Badge variant="outline">
                      {getFitnessLevelLabel(profile.fitness_level)}
                    </Badge>
                  </div>
                  {profile.gender && (
                    <div className="flex items-center justify-between">
                      <span>Gênero</span>
                      <span className="font-medium">{getGenderLabel(profile.gender)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Configurações */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="card-agita">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_public">Perfil Público</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que outros usuários vejam seu perfil
                    </p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                    disabled={!isEditing}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow_friend_requests">Solicitações de Amizade</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que outros usuários enviem solicitações de amizade
                    </p>
                  </div>
                  <Switch
                    id="allow_friend_requests"
                    checked={formData.allow_friend_requests}
                    onCheckedChange={(checked) => handleInputChange('allow_friend_requests', checked)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-agita">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  As configurações de notificação serão implementadas em uma futura atualização.
                </p>
              </CardContent>
            </Card>

            <Card className="card-agita">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Cidade</span>
                  <span className="font-medium">{profile.city}</span>
                </div>
                {profile.neighborhood && (
                  <div className="flex items-center justify-between">
                    <span>Bairro</span>
                    <span className="font-medium">{profile.neighborhood}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Profile;