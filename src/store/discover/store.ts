import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { MCPAction, createMCPSlice } from './slices/mcp';

//  ===============  聚合 createStoreFn ============ //

export type DiscoverStore = MCPAction;

const createStore: StateCreator<DiscoverStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...createMCPSlice(...parameters),
});

//  ===============  实装 useStore ============ //

const devtools = createDevtools('discover');

export const useDiscoverStore = createWithEqualityFn<DiscoverStore>()(
  devtools(createStore),
  shallow,
);

export const getDiscoverStoreState = () => useDiscoverStore.getState();
