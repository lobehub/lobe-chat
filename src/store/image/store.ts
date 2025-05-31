import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { ImageStoreState, initialState } from './initialState';
import {
  GenerationConfigAction,
  createGenerationConfigSlice,
} from './slices/generationConfig/action';
import { GenerationTopicAction, createGenerationTopicSlice } from './slices/generationTopic/action';

//  ===============  aggregate createStoreFn ============ //

export interface ImageStore
  extends GenerationConfigAction,
    GenerationTopicAction,
    ImageStoreState {}

const createStore: StateCreator<ImageStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createGenerationConfigSlice(...parameters),
  ...createGenerationTopicSlice(...parameters),
});

//  ===============  implement useStore ============ //

const devtools = createDevtools('image');

export const useImageStore = createWithEqualityFn<ImageStore>()(devtools(createStore), shallow);

export const getImageStoreState = () => useImageStore.getState();
