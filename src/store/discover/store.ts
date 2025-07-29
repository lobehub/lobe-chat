import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { AssistantAction, createAssistantSlice } from './slices/assistant/action';
import { MCPAction, createMCPSlice } from './slices/mcp';
import { ModelAction, createModelSlice } from './slices/model/action';
import { PluginAction, createPluginSlice } from './slices/plugin/action';
import { ProviderAction, createProviderSlice } from './slices/provider/action';

//  ===============  聚合 createStoreFn ============ //

export type DiscoverStore = MCPAction &
  AssistantAction &
  ProviderAction &
  ModelAction &
  PluginAction;

const createStore: StateCreator<DiscoverStore, [['zustand/devtools', never]]> = (
  ...parameters
) => ({
  ...createMCPSlice(...parameters),
  ...createAssistantSlice(...parameters),
  ...createProviderSlice(...parameters),
  ...createModelSlice(...parameters),
  ...createPluginSlice(...parameters),
});

//  ===============  实装 useStore ============ //

const devtools = createDevtools('discover');

export const useDiscoverStore = createWithEqualityFn<DiscoverStore>()(
  devtools(createStore),
  shallow,
);

export const getDiscoverStoreState = () => useDiscoverStore.getState();
