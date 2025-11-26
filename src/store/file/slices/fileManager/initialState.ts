import { FileListItem, QueryFileListParams } from '@/types/files';
import { UploadFileItem } from '@/types/files/upload';

export interface FileManagerState {
  creatingChunkingTaskIds: string[];
  creatingEmbeddingTaskIds: string[];
  currentFolderId?: string | null;
  dockUploadFileList: UploadFileItem[];
  fileDetail?: FileListItem;
  fileList: FileListItem[];
  queryListParams?: QueryFileListParams;
}

export const initialFileManagerState: FileManagerState = {
  creatingChunkingTaskIds: [],
  creatingEmbeddingTaskIds: [],
  currentFolderId: undefined,
  dockUploadFileList: [],
  fileList: [],
};
