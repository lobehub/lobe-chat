import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { ToolStoreState, initialState } from './initialState';
import { CustomPluginAction, createCustomPluginSlice } from './slices/customPlugin';
import { PluginAction, createPluginSlice } from './slices/plugin';
import { PluginStoreAction, createPluginStoreSlice } from './slices/store';

//  ===============  聚合 createStoreFn ============ //

export type ToolStore = ToolStoreState & CustomPluginAction & PluginAction & PluginStoreAction;

const createStore: StateCreator<ToolStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createPluginSlice(...parameters),
  ...createCustomPluginSlice(...parameters),
  ...createPluginStoreSlice(...parameters),
});

//  ===============  实装 useStore ============ //

export const useToolStore = createWithEqualityFn<ToolStore>()(
  devtools(createStore, {
    name: 'LobeChat_Plugin' + (isDev ? '_DEV' : ''),
  }),
  shallow,
);
