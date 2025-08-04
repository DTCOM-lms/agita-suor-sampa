import React, { useState } from 'react';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import SocialFeed from '@/components/SocialFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Users, 
  TrendingUp, 
  Filter,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Activity,
  MapPin,
  Globe,
  Lock,
  UserPlus
} from 'lucide-react';
import { 
  useUserPosts, 
  useCreatePost 
} from '@/hooks/useSocialFeed';
import { 
  usePublicActivities,
  useUserCompletedActivities
} from '@/hooks/useActivities';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Social = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostVisibility, setNewPostVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedActivity, setSelectedActivity] = useState<string>('none');

  // Hooks para dados sociais
  const { data: userPosts } = useUserPosts(user?.id || '', 10);
  const { data: publicActivities, isLoading: activitiesLoading } = usePublicActivities(8);
  const { data: userCompletedActivities } = useUserCompletedActivities(20);
  const createPost = useCreatePost();

  // Buscar usuários (simulado - poderia ser um hook real)
  const searchUsers = async (term: string) => {
    // Esta funcionalidade poderia ser expandida com um hook useSearchUsers
    console.log('Searching users:', term);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && selectedActivity === 'none') {
      toast.error('Digite algo ou selecione uma atividade para publicar');
      return;
    }

    try {
      const hasActivity = selectedActivity !== 'none';
      const postType = hasActivity ? 'activity_completed' : 'general_post';
      
      await createPost.mutateAsync({
        content: newPostContent || undefined,
        post_type: postType,
        visibility: newPostVisibility,
        activity_id: hasActivity ? selectedActivity : undefined
      });
      
      setNewPostContent('');
      setSelectedActivity('none');
      setShowCreatePost(false);
      toast.success('Post publicado com sucesso!');
    } catch (error) {
      toast.error('Erro ao publicar post');
    }
  };

  // Estatísticas sociais
  const totalLikes = userPosts?.reduce((sum, post) => sum + post.likes_count, 0) || 0;
  const totalComments = userPosts?.reduce((sum, post) => sum + post.comments_count, 0) || 0;
  const totalPosts = userPosts?.length || 0;

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-24 max-w-6xl">
        {/* Header da Página Social */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Comunidade Agita</h1>
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="gradient-animation">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Post</DialogTitle>
                  <DialogDescription>
                    Compartilhe seus pensamentos ou uma atividade com a comunidade.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
                      <AvatarFallback>
                        {getUserInitials(profile?.full_name || user?.user_metadata?.full_name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profile?.full_name || user?.user_metadata?.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{profile?.username || 'usuario'}</p>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="O que você está fazendo hoje?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={3}
                  />

                  {/* Seleção de Atividade */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Anexar uma atividade (opcional)</label>
                    <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma atividade concluída" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="none">Nenhuma atividade</SelectItem>
                        {userCompletedActivities?.map((activity) => (
                          <SelectItem key={activity.id} value={activity.id}>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              <span>{activity.title}</span>
                              <span className="text-xs text-muted-foreground">
                                ({activity.activity_types?.name})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Select value={newPostVisibility} onValueChange={(value: any) => setNewPostVisibility(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Público
                          </div>
                        </SelectItem>
                        <SelectItem value="friends">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Amigos
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Privado
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={handleCreatePost}
                      disabled={createPost.isPending || (!newPostContent.trim() && selectedActivity === 'none')}
                    >
                      {createPost.isPending ? 'Publicando...' : 'Publicar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-agita">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meus Posts</p>
                    <p className="text-2xl font-bold">{totalPosts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-agita">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Curtidas</p>
                    <p className="text-2xl font-bold">{totalLikes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-agita">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Comentários</p>
                    <p className="text-2xl font-bold">{totalComments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-agita">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Comunidade</p>
                    <p className="text-2xl font-bold">150+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Feed Geral</TabsTrigger>
            <TabsTrigger value="discover">Descobrir</TabsTrigger>
            <TabsTrigger value="my-posts">Meus Posts</TabsTrigger>
          </TabsList>

          {/* Feed Geral */}
          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar com Feed de Atividades */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="card-agita">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Atividades Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activitiesLoading ? (
                      <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-muted rounded-full" />
                              <div className="flex-1 space-y-1">
                                <div className="h-3 bg-muted rounded w-3/4" />
                                <div className="h-2 bg-muted rounded w-1/2" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : publicActivities && publicActivities.length > 0 ? (
                      publicActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={activity.profiles?.avatar_url} />
                            <AvatarFallback className="text-xs">
                              {getUserInitials(activity.profiles?.full_name || 'User')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium truncate">
                                {activity.profiles?.full_name}
                              </p>
                              <Badge variant="outline" className="text-xs px-1">
                                Nv. {activity.profiles?.level || 1}
                              </Badge>
                            </div>
                            <p className="text-xs font-medium text-primary truncate">
                              {activity.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="truncate">{activity.activity_types?.name}</span>
                              {activity.distance_km && (
                                <span>• {activity.distance_km.toFixed(1)}km</span>
                              )}
                              {activity.suor_earned && (
                                <span className="text-yellow-600">• {activity.suor_earned} SUOR</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Nenhuma atividade recente
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Dica para criar posts */}
                <Card className="card-agita">
                  <CardContent className="p-4">
                    <div className="text-center space-y-2">
                      <MessageCircle className="h-6 w-6 text-primary mx-auto" />
                      <p className="text-sm font-medium">Compartilhe sua jornada!</p>
                      <p className="text-xs text-muted-foreground">
                        Crie posts e anexe suas atividades para inspirar a comunidade.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowCreatePost(true)}
                        className="w-full"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Novo Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feed Principal */}
              <div className="lg:col-span-3">
                <SocialFeed />
              </div>
            </div>
          </TabsContent>

          {/* Descobrir */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="card-agita">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Encontrar Pessoas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers(searchTerm)}
                  />
                  <Button onClick={() => searchUsers(searchTerm)}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Funcionalidade em Desenvolvimento</h3>
                  <p className="text-muted-foreground">
                    Em breve você poderá buscar e conectar com outros usuários da comunidade Agita.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meus Posts */}
          <TabsContent value="my-posts" className="space-y-6">
            {userPosts && userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <Card key={post.id} className="card-agita">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback>
                            {getUserInitials(post.profiles?.full_name || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{post.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(post.created_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" />
                          <span>{post.shares_count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-agita">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum post seu ainda</h3>
                  <p className="text-muted-foreground mb-4">
                    Compartilhe suas atividades e conquistas com a comunidade!
                  </p>
                  <Button onClick={() => setShowCreatePost(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Post
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Social;