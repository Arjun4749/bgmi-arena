import { useState } from 'react';
import { supabase, MEDIA_BUCKET } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

// Upload a file to the media bucket and return its public URL.
export function useUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File, folder = 'misc'): Promise<string | null> => {
    if (!file) return null;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}
