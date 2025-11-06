import { UploadFileItem } from '@lobechat/types';

export interface ImageFileState {
  chatUploadFileList: UploadFileItem[];
  uploadingIds: string[];
}

export const initialImageFileState: ImageFileState = {
  chatUploadFileList: [],
  uploadingIds: [],
};
