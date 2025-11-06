import { UploadFileItem } from '@lobechat/types';

/**
 * Extended UploadFileItem for mobile
 * Includes additional metadata that mobile needs for file handling
 */
export interface MobileUploadFileItem extends UploadFileItem {
  fileHash?: string;
  fileType?: string;
  name?: string;
  size?: number;
  url?: string;
}
