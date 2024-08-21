import { FilesStoreState } from '../../initialState';

const chatUploadFileList = (s: FilesStoreState) => s.chatUploadFileList;
const isImageUploading = (s: FilesStoreState) => s.uploadingIds.length > 0;

export const filesSelectors = {
  chatUploadFileList,
  isImageUploading,
};
