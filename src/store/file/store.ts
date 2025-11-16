import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { FilesStoreState, initialState } from './initialState';
import { FileAction, createFileSlice } from './slices/chat';
import { FileChunkAction, createFileChunkSlice } from './slices/chunk';
import { DocumentAction, createDocumentSlice } from './slices/document';
import { FileManageAction, createFileManageSlice } from './slices/fileManager';
import { TTSFileAction, createTTSFileSlice } from './slices/tts';
import { FileUploadAction, createFileUploadSlice } from './slices/upload/action';

//  ===============  聚合 createStoreFn ============ //

export type FileStore = FilesStoreState &
  FileAction &
  DocumentAction &
  TTSFileAction &
  FileManageAction &
  FileChunkAction &
  FileUploadAction;

const createStore: StateCreator<FileStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createFileSlice(...parameters),
  ...createDocumentSlice(...parameters),
  ...createFileManageSlice(...parameters),
  ...createTTSFileSlice(...parameters),
  ...createFileChunkSlice(...parameters),
  ...createFileUploadSlice(...parameters),
});

//  ===============  实装 useStore ============ //
const devtools = createDevtools('file');

export const useFileStore = createWithEqualityFn<FileStore>()(devtools(createStore), shallow);

export const getFileStoreState = () => useFileStore.getState();
