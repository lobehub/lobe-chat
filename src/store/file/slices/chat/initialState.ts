import { FilePreview } from '@/types/files';
import { UploadFileItem } from '@/types/files/upload';

export interface ImageFileState {
  chatUploadFileList: UploadFileItem[];
  imagesMap: Record<string, FilePreview>;
  /**
   * @deprecated
   */
  inputFilesList: string[];
  uploadingIds: string[];
}

export const initialImageFileState: ImageFileState = {
  chatUploadFileList: [],
  imagesMap: {},
  inputFilesList: [],
  uploadingIds: [],
};
