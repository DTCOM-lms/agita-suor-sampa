import { Heart, MessageCircle, Share2, Trophy, MapPin, Timer, Route, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useSocialFeed, useLikePost, useCheckPostLike } from "@/hooks/useSocialFeed";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

interface SocialPost {
  id: string;
  user_id: string;
  activity_id?: string;
  content?: string;
  post_type: 'activity_completed' | 'achievement_unlocked' | 'general_post' | 'check_in' | 'challenge_completed';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
    level: number;
  };
  activities?: {
    id: string;
    title: string;
    duration_minutes?: number;
    distance_km?: number;
    suor_earned: number;
    activity_types?: {
      name: string;
      category: string;
    };
  };
  achievements?: {
    name: string;
    description: string;
    rarity: string;
    suor_reward: number;
  };
}

interface FeedItemProps {
  post: SocialPost;
}

const FeedItem = ({ post }: FeedItemProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const { data: isLiked, isLoading: isLikeLoading } = useCheckPostLike(post.id);
  const likePost = useLikePost();

  const handleLike = async () => {
    if (isLiking || isLikeLoading) return;
    
    setIsLiking(true);
    try {
      await likePost.mutateAsync({ postId: post.id, isLiked: !!isLiked });
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const getPostContent = () => {
    switch (post.post_type) {
      case 'activity_completed':
        if (post.activities) {
          return `Completou: ${post.activities.title}`;
        }
        return 'Completou uma atividade';
      
      case 'achievement_unlocked':
        const achievement = post.achievements;
        if (achievement) {
          return `Desbloqueou a conquista: ${achievement.name}`;
        }
        return 'Desbloqueou uma nova conquista';
      
      case 'check_in':
        return 'Fez check-in em um local';
      
      case 'challenge_completed':
        return 'Completou um desafio';
      
      default:
        return post.content || 'Compartilhou uma atividade';
    }
  };

  const getPostIcon = () => {
    switch (post.post_type) {
      case 'activity_completed':
        return getActivityIcon(post.activities?.activity_types?.category);
      case 'achievement_unlocked':
        return '🏆';
      case 'check_in':
        return '📍';
      case 'challenge_completed':
        return '🎯';
      default:
        return '💪';
    }
  };

  const getActivityIcon = (category?: string) => {
    switch (category) {
      case 'running': return '🏃‍♂️';
      case 'cycling': return '🚴‍♂️';
      case 'walking': return '🚶‍♂️';
      case 'swimming': return '🏊‍♂️';
      case 'yoga': return '🧘‍♀️';
      case 'gym': return '💪';
      default: return '⚡';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ptBR
    });
  };

  const suorEarned = post.activities?.suor_earned || 
                    post.achievements?.suor_reward || 
                    0;

  return (
    <Card className="card-agita">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.profiles?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {post.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.profiles?.full_name || 'Usuário'}</span>
              <Badge variant="outline" className="text-xs">
                Nível {post.profiles?.level || 1}
              </Badge>
              {post.post_type === 'achievement_unlocked' && (
                <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 rounded-full">
                  <Trophy className="h-3 w-3 text-warning" />
                  <span className="text-xs text-warning font-medium">Nova conquista!</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span>{getPostIcon()}</span>
                <span>{getPostContent()}</span>
              </span>
              <span>•</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
          {suorEarned > 0 && (
            <div className="suor-coin">
              <Coins className="w-3 h-3" />
              <span>+{suorEarned}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Activity Details */}
        {post.activities && (
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
            {post.activities.duration_minutes && (
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                <span>{Math.round(post.activities.duration_minutes)} min</span>
              </div>
            )}
            {post.activities.distance_km && (
              <div className="flex items-center gap-1">
                <Route className="h-4 w-4" />
                <span>{post.activities.distance_km.toFixed(1)} km</span>
              </div>
            )}
            {post.activities.activity_types && (
              <Badge variant="secondary" className="text-xs">
                {post.activities.activity_types.name}
              </Badge>
            )}
          </div>
        )}

        {/* Achievement Details */}
        {post.post_type === 'achievement_unlocked' && post.achievements && (
          <div className="mb-4 p-3 bg-warning/5 rounded-lg border border-warning/20">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-warning" />
              <span className="font-semibold text-sm">{post.achievements.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {post.achievements.description}
            </p>
          </div>
        )}

        {/* Custom content */}
        {post.content && (
          <div className="mb-4 text-sm">
            {post.content}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={handleLike}
              disabled={isLiking || isLikeLoading}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{post.likes_count}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SocialFeed = () => {
  const { data: feedPosts, isLoading, error } = useSocialFeed(10);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Feed Social</h3>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="card-agita animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2" />
                    <div className="h-3 bg-muted rounded w-48" />
                  </div>
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-12 bg-muted rounded mb-4" />
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <div className="h-8 w-12 bg-muted rounded" />
                    <div className="h-8 w-12 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Feed Social</h3>
        <Card className="card-agita">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground mb-2">
              Erro ao carregar o feed social
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!feedPosts || feedPosts.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Feed Social</h3>
        <Card className="card-agita">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground mb-4">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium mb-1">Nenhuma atividade ainda</p>
              <p className="text-sm">
                Complete atividades e desbloqueie conquistas para aparecer no feed!
              </p>
            </div>
            <Button onClick={() => window.location.href = '/'}>
              Começar Atividade
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Feed Social</h3>
        <Badge variant="outline" className="text-xs">
          {feedPosts.length} {feedPosts.length === 1 ? 'post' : 'posts'}
        </Badge>
      </div>
      
      <div className="space-y-4">
        {feedPosts.map((post) => (
          <FeedItem key={post.id} post={post} />
        ))}
      </div>
      
      {feedPosts.length >= 10 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm">
            Carregar mais posts
          </Button>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;