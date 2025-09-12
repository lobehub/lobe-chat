import { getAudioMimeType, isAudioMimeType } from '@lobehub/const/file';

/**
 * Convert audio URL to base64 string with metadata
 */
export const audioUrlToBase64 = async (
  audioUrl: string,
): Promise<{ base64: string; mimeType: string; duration?: number }> => {
  try {
    const res = await fetch(audioUrl);
    const blob = await res.blob();
    
    // Validate it's an audio file
    if (!isAudioMimeType(blob.type)) {
      throw new Error(`Invalid audio MIME type: ${blob.type}`);
    }
    
    const arrayBuffer = await blob.arrayBuffer();

    // Convert to base64
    const base64 =
      typeof btoa === 'function'
        ? btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          )
        : Buffer.from(arrayBuffer).toString('base64');

    // Try to get duration if in browser environment
    let duration: number | undefined;
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      try {
        duration = await getAudioDuration(audioUrl);
      } catch (error) {
        console.warn('Failed to get audio duration:', error);
      }
    }

    return { base64, mimeType: blob.type, duration };
  } catch (error) {
    console.error('Error converting audio to base64:', error);
    throw error;
  }
};

/**
 * Get audio duration in seconds
 */
export const getAudioDuration = (audioUrl: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      reject(new Error('Audio API not available'));
      return;
    }

    const audio = new Audio();
    
    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', handleLoad);
      audio.removeEventListener('error', handleError);
    };
    
    const handleLoad = () => {
      cleanup();
      resolve(audio.duration);
    };
    
    const handleError = () => {
      cleanup();
      reject(new Error('Failed to load audio'));
    };
    
    audio.addEventListener('loadedmetadata', handleLoad);
    audio.addEventListener('error', handleError);
    audio.src = audioUrl;
  });
};

/**
 * Validate audio file
 */
export const validateAudioFile = (file: File | Blob): { valid: boolean; error?: string } => {
  // Check MIME type
  if (!isAudioMimeType(file.type)) {
    const mimeType = getAudioMimeType(file.name || '') || file.type;
    if (!mimeType || !isAudioMimeType(mimeType)) {
      return { valid: false, error: 'Invalid audio file type' };
    }
  }
  
  // Check file size (max 100MB for audio)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Audio file too large (max 100MB)' };
  }
  
  return { valid: true };
};

/**
 * Extract audio metadata
 */
export interface AudioMetadata {
  duration?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: number;
  format?: string;
}

export const extractAudioMetadata = async (audioUrl: string): Promise<AudioMetadata> => {
  const metadata: AudioMetadata = {};
  
  if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
    try {
      const duration = await getAudioDuration(audioUrl);
      metadata.duration = duration;
    } catch (error) {
      console.warn('Failed to extract audio metadata:', error);
    }
  }
  
  // Note: Additional metadata extraction would require Web Audio API or server-side processing
  // This is a placeholder for future enhancement
  
  return metadata;
};