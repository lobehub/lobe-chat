import { ChatContextContent } from '@lobechat/types';

import { UploadFileItem } from '@/types/files/upload';

export interface ImageFileState {
  chatContextSelections: ChatContextContent[];
  chatUploadFileList: UploadFileItem[];
  uploadingIds: string[];
}

export const initialImageFileState: ImageFileState = {
  chatContextSelections: [],
  chatUploadFileList: [],
  uploadingIds: [],
};
