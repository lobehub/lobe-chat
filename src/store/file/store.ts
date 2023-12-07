import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { FilesStoreState, initialState } from './initialState';
import { FileAction, createFileSlice } from './slices/images';
import { TTSFileAction, createTTSFileSlice } from './slices/tts';

//  ===============  聚合 createStoreFn ============ //

export type FileStore = FilesStoreState & FileAction & TTSFileAction;

const createStore: StateCreator<FileStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createFileSlice(...parameters),
  ...createTTSFileSlice(...parameters),
});

//  ===============  实装 useStore ============ //

export const useFileStore = createWithEqualityFn<FileStore>()(
  devtools(createStore, {
    name: 'LobeChat_File' + (isDev ? '_DEV' : ''),
  }),
  shallow,
);
