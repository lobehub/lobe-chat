import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { FilesStoreState, initialState } from './initialState';
import { FileAction, createFileSlice } from './slices/chat';
import { TTSFileAction, createTTSFileSlice } from './slices/tts';

//  ===============  聚合 createStoreFn ============ //

export type FileStore = FilesStoreState & FileAction & TTSFileAction;

const createStore: StateCreator<FileStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createFileSlice(...parameters),
  ...createTTSFileSlice(...parameters),
});

//  ===============  实装 useStore ============ //
const devtools = createDevtools('file');

export const useFileStore = createWithEqualityFn<FileStore>()(devtools(createStore), shallow);
