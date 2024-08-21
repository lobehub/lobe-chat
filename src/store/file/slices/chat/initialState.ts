import { FilePreview } from '@/types/files';
import { UploadFileItem } from '@/types/files/upload';

export interface ImageFileState {
  chatUploadFileList: UploadFileItem[];
  /**
   * it should be removed after dalle plugin refactor
   * @deprecated
   */
  imagesMap: Record<string, FilePreview>;
  uploadingIds: string[];
}

export const initialImageFileState: ImageFileState = {
  chatUploadFileList: [],
  imagesMap: {},
  uploadingIds: [],
};
