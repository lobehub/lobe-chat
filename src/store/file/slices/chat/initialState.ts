import { FileListItem } from '@/types/files';
import { UploadFileItem } from '@/types/files/upload';

export interface ImageFileState {
  chatUploadFileList: UploadFileItem[];
  /**
   * Local optimistic document map for immediate UI updates
   * Key: document ID, Value: FileListItem
   */
  localDocumentMap: Map<string, FileListItem>;
  uploadingIds: string[];
}

export const initialImageFileState: ImageFileState = {
  chatUploadFileList: [],
  localDocumentMap: new Map(),
  uploadingIds: [],
};
