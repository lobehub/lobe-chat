import { UploadFileItem } from '@lobechat/types';

import { FileStore } from './store';

const getChatUploadFileList = (s: FileStore): UploadFileItem[] => s.chatUploadFileList;

const isUploadingFiles = (s: FileStore): boolean => s.uploadingIds.length > 0;

const uploadFileListHasItem = (s: FileStore): boolean => s.chatUploadFileList.length > 0;

export const fileSelectors = {
  getChatUploadFileList,
  isUploadingFiles,
  uploadFileListHasItem,
};
