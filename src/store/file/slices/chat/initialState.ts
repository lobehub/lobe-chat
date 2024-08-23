import { UploadFileItem } from '@/types/files/upload';

export interface ImageFileState {
  chatUploadFileList: UploadFileItem[];
  uploadingIds: string[];
}

export const initialImageFileState: ImageFileState = {
  chatUploadFileList: [],
  uploadingIds: [],
};
