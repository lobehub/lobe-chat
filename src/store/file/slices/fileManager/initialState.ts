import { FileListItem, QueryFileListParams } from '@/types/files';
import { UploadFileItem } from '@/types/files/upload';

export interface FileManagerState {
  creatingChunkingTaskIds: string[];
  creatingEmbeddingTaskIds: string[];
  dockUploadFileList: UploadFileItem[];
  fileDetail?: FileListItem;
  fileList: FileListItem[];
  queryListParams?: QueryFileListParams;
}

export const initialFileManagerState: FileManagerState = {
  creatingChunkingTaskIds: [],
  creatingEmbeddingTaskIds: [],
  dockUploadFileList: [],
  fileList: [],
};
