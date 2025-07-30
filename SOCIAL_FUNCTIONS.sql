-- Executar no Supabase SQL Editor
-- Funções para sistema social (likes e comentários)

-- Função para incrementar likes de um post
CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE social_posts 
  SET likes_count = likes_count + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar likes de um post
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE social_posts 
  SET likes_count = GREATEST(likes_count - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar comentários de um post
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE social_posts 
  SET comments_count = comments_count + 1,
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar comentários de um post
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE social_posts 
  SET comments_count = GREATEST(comments_count - 1, 0),
      updated_at = NOW()
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar likes de um comentário
CREATE OR REPLACE FUNCTION increment_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE social_post_comments 
  SET likes_count = likes_count + 1,
      updated_at = NOW()
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para decrementar likes de um comentário
CREATE OR REPLACE FUNCTION decrement_comment_likes(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE social_post_comments 
  SET likes_count = GREATEST(likes_count - 1, 0),
      updated_at = NOW()
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para deletar likes quando comentário é deletado
CREATE OR REPLACE FUNCTION cleanup_comment_likes()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrementar contador de comentários do post
  UPDATE social_posts 
  SET comments_count = GREATEST(comments_count - 1, 0),
      updated_at = NOW()
  WHERE id = OLD.post_id;
  
  -- Deletar likes do comentário
  DELETE FROM social_post_comment_likes 
  WHERE comment_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger
DROP TRIGGER IF EXISTS on_comment_deleted ON social_post_comments;
CREATE TRIGGER on_comment_deleted
  BEFORE DELETE ON social_post_comments
  FOR EACH ROW EXECUTE FUNCTION cleanup_comment_likes(); 