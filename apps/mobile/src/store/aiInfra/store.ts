import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { AIProviderStoreState, initialState } from './initialState';
import { AiModelAction, createAiModelSlice } from './slices/aiModel/action';
import { AiProviderAction, createAiProviderSlice } from './slices/aiProvider/action';

//  ===============  聚合 createStoreFn ============ //

export interface AiInfraStore extends AIProviderStoreState, AiProviderAction, AiModelAction {
  /* empty */
}

const createStore: StateCreator<AiInfraStore> = (...parameters) => ({
  ...initialState,
  ...createAiModelSlice(...parameters),
  ...createAiProviderSlice(...parameters),
});

//  ===============  实装 useStore ============ //

export const useAiInfraStore = createWithEqualityFn<AiInfraStore>()(createStore, shallow);

export const getAiInfraStoreState = () => useAiInfraStore.getState();
