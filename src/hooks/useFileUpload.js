import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } catch (err) {
      setError(err.message);
      console.error('File upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return null;
    return uploadFile(file);
  };

  return { uploadFile, handleFileInput, uploading, error };
}