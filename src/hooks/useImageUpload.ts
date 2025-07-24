import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseImageUploadOptions {
  bucket: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

export const useImageUpload = ({
  bucket = 'avatars',
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: UseImageUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Use: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`;
    }

    return null;
  };

  const uploadImage = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: validationError,
        });
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: error.message,
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      setUploadProgress(100);
      
      toast({
        title: "Upload realizado com sucesso!",
        description: "Sua imagem foi enviada.",
      });

      return publicUrl;

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Erro inesperado. Tente novamente.",
      });
      return null;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts[pathParts.length - 1];

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        toast({
          variant: "destructive",
          title: "Erro ao deletar",
          description: error.message,
        });
        return false;
      }

      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso.",
      });

      return true;

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Erro ao deletar",
        description: "Erro inesperado. Tente novamente.",
      });
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    uploadProgress,
    validateFile,
  };
}; 