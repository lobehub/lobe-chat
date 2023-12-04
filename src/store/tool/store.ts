import { PersistOptions, devtools, persist } from 'zustand/middleware';
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

//  ===============  persist 本地缓存中间件配置 ============ //

type SessionPersist = Pick<
  ToolStore,
  'pluginList' | 'pluginManifestMap' | 'pluginsSettings' | 'customPluginList'
>;

const persistOptions: PersistOptions<ToolStore, SessionPersist> = {
  name: 'LOBE_PLUGIN',

  partialize: (s) => ({
    customPluginList: s.customPluginList,
    pluginList: s.pluginList,
    pluginManifestMap: s.pluginManifestMap,
    pluginsSettings: s.pluginsSettings,
  }),

  // 手动控制 Hydration ，避免 ssr 报错
  skipHydration: true,
  version: 0,
};

//  ===============  实装 useStore ============ //

export const useToolStore = createWithEqualityFn<ToolStore>()(
  persist(
    devtools(createStore, {
      name: 'LobeChat_Plugin' + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  shallow,
);
