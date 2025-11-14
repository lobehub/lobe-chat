import { ImageFileState, initialImageFileState } from './slices/chat';
import { FileChunkState, initialFileChunkState } from './slices/chunk';
import { DocumentState, initialDocumentState } from './slices/document';
import { FileManagerState, initialFileManagerState } from './slices/fileManager';

export type FilesStoreState = ImageFileState &
  DocumentState &
  FileManagerState &
  FileChunkState;

export const initialState: FilesStoreState = {
  ...initialImageFileState,
  ...initialDocumentState,
  ...initialFileManagerState,
  ...initialFileChunkState,
};
