import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { AIProviderStoreState, initialState } from './initialState';
import { AiModelAction, createAiModelSlice } from './slices/aiModel';
import { AiProviderAction, createAiProviderSlice } from './slices/aiProvider';

//  ===============  聚合 createStoreFn ============ //

export interface AiInfraStore extends AIProviderStoreState, AiProviderAction, AiModelAction {
  /* empty */
}

const createStore: StateCreator<AiInfraStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createAiModelSlice(...parameters),
  ...createAiProviderSlice(...parameters),
});

//  ===============  实装 useStore ============ //
const devtools = createDevtools('aiInfra');

export const useAiInfraStore = createWithEqualityFn<AiInfraStore>()(devtools(createStore), shallow);

export const getAiInfraStoreState = () => useAiInfraStore.getState();
