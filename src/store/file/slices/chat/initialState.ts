import { FileListItem } from '@/types/files';
import { UploadFileItem } from '@/types/files/upload';

export interface ImageFileState {
  chatUploadFileList: UploadFileItem[];
  /**
   * Local optimistic note map for immediate UI updates
   * Key: note ID, Value: FileListItem
   */
  localNoteMap: Map<string, FileListItem>;
  uploadingIds: string[];
}

export const initialImageFileState: ImageFileState = {
  chatUploadFileList: [],
  localNoteMap: new Map(),
  uploadingIds: [],
};
