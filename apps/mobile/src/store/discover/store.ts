import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { AssistantAction, createAssistantSlice } from './slices/assistant/action';

//  ===============  聚合 createStoreFn ============ //

export type DiscoverStore = AssistantAction;

const createStore: StateCreator<DiscoverStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...createAssistantSlice(...parameters),
});

//  ===============  实装 useStore ============ //

const devtools = createDevtools('discover');

export const useDiscoverStore = createWithEqualityFn<DiscoverStore>()(
  devtools(createStore),
  shallow,
);

export const getDiscoverStoreState = () => useDiscoverStore.getState();
