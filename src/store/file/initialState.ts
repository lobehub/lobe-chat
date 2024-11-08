import { ImageFileState, initialImageFileState } from './slices/chat';
import { FileChunkState, initialFileChunkState } from './slices/chunk';
import { FileManagerState, initialFileManagerState } from './slices/fileManager';

export type FilesStoreState = ImageFileState & FileManagerState & FileChunkState;

export const initialState: FilesStoreState = {
  ...initialImageFileState,
  ...initialFileManagerState,
  ...initialFileChunkState,
};
