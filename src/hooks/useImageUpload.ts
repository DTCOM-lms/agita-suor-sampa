import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadImageParams {
  file: File;
  bucket?: string;
  path?: string;
}

export const useImageUpload = () => {
  return useMutation({
    mutationFn: async ({ file, bucket = 'avatars', path }: UploadImageParams) => {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de arquivo não suportado. Use: ${allowedTypes.join(', ')}`);
      }

      // Validate file size (5MB max)
      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        throw new Error('Arquivo muito grande. Tamanho máximo: 5MB');
      }

      // Generate unique filename if path not provided
      const fileExt = file.name.split('.').pop();
      const fileName = path || `${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw new Error(`Erro no upload: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onSuccess: () => {
      toast.success('Upload realizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}; 