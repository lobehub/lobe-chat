import { FileListItem, QueryFileListParams } from '@/types/files';
import { UploadFileItem } from '@/types/files/upload';

export interface FileManagerState {
  creatingChunkingTaskIds: string[];
  creatingEmbeddingTaskIds: string[];
  currentFolderId?: string | null;
  dockUploadFileList: UploadFileItem[];
  fileDetail?: FileListItem;
  fileList: FileListItem[];
  fileListHasMore: boolean;
  fileListOffset: number;
  pendingRenameItemId: string | null;
  queryListParams?: QueryFileListParams;
}

export const initialFileManagerState: FileManagerState = {
  creatingChunkingTaskIds: [],
  creatingEmbeddingTaskIds: [],
  currentFolderId: undefined,
  dockUploadFileList: [],
  fileList: [],
  fileListHasMore: false,
  fileListOffset: 0,
  pendingRenameItemId: null,
};
