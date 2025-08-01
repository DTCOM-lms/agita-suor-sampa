import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SocialPost {
  id: string;
  user_id: string;
  activity_id?: string;
  content?: string;
  post_type: 'activity_completed' | 'achievement_unlocked' | 'general_post' | 'check_in' | 'challenge_completed';
  media_urls?: string[];
  location?: any; // geometry
  visibility: 'public' | 'friends' | 'private';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  // Relations
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

interface PostLike {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface PostComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  parent_comment_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useSocialFeed = (limit = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['social-feed', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles!social_posts_user_id_fkey(
            id, full_name, username, avatar_url, level
          ),
          activities(
            id, title, duration_minutes, distance_km, suor_earned,
            activity_types(name, category)
          ),
          achievements(
            name, description, rarity, suor_reward
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SocialPost[];
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useUserPosts = (userId: string, limit = 10) => {
  return useQuery({
    queryKey: ['user-posts', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          profiles!social_posts_user_id_fkey(
            id, full_name, username, avatar_url, level
          ),
          activities(
            id, title, duration_minutes, distance_km, suor_earned,
            activity_types(name, category)
          )
        `)
        .eq('user_id', userId)
        .neq('visibility', 'private')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SocialPost[];
    },
    enabled: !!userId,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postData: {
      activity_id?: string;
      content?: string;
      post_type: SocialPost['post_type'];
      media_urls?: string[];
      visibility?: 'public' | 'friends' | 'private';
      location?: { lat: number; lng: number };
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      let data, error;
      
      if (postData.location) {
        // Usar RPC para inserir com geometria
        const result = await supabase
          .rpc('create_social_post_with_location', {
            p_user_id: user.id,
            p_post_type: postData.post_type,
            p_longitude: postData.location.lng,
            p_latitude: postData.location.lat,
            p_activity_id: postData.activity_id,
            p_content: postData.content,
            p_media_urls: postData.media_urls,
            p_visibility: postData.visibility || 'public'
          });
        
        data = result.data?.[0];
        error = result.error;
      } else {
        // Inserção sem localização
        const result = await supabase
          .from('social_posts')
          .insert({
            user_id: user.id,
            activity_id: postData.activity_id,
            content: postData.content,
            post_type: postData.post_type,
            media_urls: postData.media_urls,
            visibility: postData.visibility || 'public',
            likes_count: 0,
            comments_count: 0,
            shares_count: 0,
            is_pinned: false
          })
          .select(`
            *,
            profiles!social_posts_user_id_fkey(
              id, full_name, username, avatar_url, level
            )
          `)
          .single();
          
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
  });
};

export const usePostLikes = (postId: string) => {
  return useQuery({
    queryKey: ['post-likes', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_post_likes')
        .select(`
          *,
          profiles(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PostLike[];
    },
    enabled: !!postId,
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('social_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Update post likes count
        const { error: updateError } = await supabase.rpc('decrement_post_likes', {
          post_id: postId
        });

        if (updateError) throw updateError;
      } else {
        // Add like
        const { error } = await supabase
          .from('social_post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;

        // Update post likes count
        const { error: updateError } = await supabase.rpc('increment_post_likes', {
          post_id: postId
        });

        if (updateError) throw updateError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-likes', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
  });
};

export const useCheckPostLike = (postId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['post-like-check', postId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;

      const { data, error } = await supabase
        .from('social_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    },
    enabled: !!postId && !!user?.id,
  });
};

export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_post_comments')
        .select(`
          *,
          profiles(id, full_name, username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PostComment[];
    },
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, content, parentCommentId }: {
      postId: string;
      content: string;
      parentCommentId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('social_post_comments')
        .insert({
          user_id: user.id,
          post_id: postId,
          content,
          parent_comment_id: parentCommentId,
          likes_count: 0
        })
        .select(`
          *,
          profiles(id, full_name, username, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Update post comments count
      const { error: updateError } = await supabase.rpc('increment_post_comments', {
        post_id: postId
      });

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    },
  });
};

// Auto create post when activity is completed
export const useCreateActivityPost = () => {
  const createPost = useCreatePost();

  const createActivityPost = async (activityId: string, content?: string) => {
    try {
      await createPost.mutateAsync({
        activity_id: activityId,
        content: content || undefined,
        post_type: 'activity_completed',
        visibility: 'public'
      });
    } catch (error) {
      console.error('Error creating activity post:', error);
    }
  };

  return { createActivityPost };
};

// Auto create post when achievement is unlocked
export const useCreateAchievementPost = () => {
  const createPost = useCreatePost();

  const createAchievementPost = async (achievementId: string, content?: string) => {
    try {
      await createPost.mutateAsync({
        content: content || undefined,
        post_type: 'achievement_unlocked',
        visibility: 'public'
      });
    } catch (error) {
      console.error('Error creating achievement post:', error);
    }
  };

  return { createAchievementPost };
}; 