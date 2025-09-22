import { formatSize } from '../format';

const VIDEO_SIZE_LIMIT = 20 * 1024 * 1024; // 20MB in bytes

export interface VideoValidationResult {
  actualSize?: string;
  isValid: boolean;
}

export const validateVideoFileSize = (file: File): VideoValidationResult => {
  if (!file.type.startsWith('video/')) {
    return { isValid: true };
  }

  const isValid = file.size <= VIDEO_SIZE_LIMIT;

  return {
    actualSize: formatSize(file.size),
    isValid,
  };
};
