import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { AiImageStoreState, initialState } from './initialState';
import {
  GenerationConfigAction,
  createGenerationConfigSlice,
} from './slices/generationConfig/action';
import { createGenerationTopicSlice } from './slices/generationTopic/action';

//  ===============  aggregate createStoreFn ============ //

export interface AiImageStore extends GenerationConfigAction, AiImageStoreState {}

const createStore: StateCreator<AiImageStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createGenerationConfigSlice(...parameters),
  ...createGenerationTopicSlice(...parameters),
});

//  ===============  implement useStore ============ //

const devtools = createDevtools('aiImage');

export const useAiImageStore = createWithEqualityFn<AiImageStore>()(devtools(createStore), shallow);

export const getAiImageStoreState = () => useAiImageStore.getState();
