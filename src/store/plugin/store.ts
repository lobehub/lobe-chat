import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { PluginStoreState, initialState } from './initialState';
import { CustomPluginAction, createCustomPluginSlice } from './slices/customPlugin';
import { PluginAction, createPluginSlice } from './slices/plugin';

//  ===============  聚合 createStoreFn ============ //

export type PluginStore = PluginStoreState & CustomPluginAction & PluginAction;

const createStore: StateCreator<PluginStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createPluginSlice(...parameters),
  ...createCustomPluginSlice(...parameters),
});

//  ===============  persist 本地缓存中间件配置 ============ //

type SessionPersist = Pick<
  PluginStore,
  'pluginList' | 'pluginManifestMap' | 'pluginsSettings' | 'customPluginList'
>;

const storeName = 'LOBE_PLUGIN';

const persistOptions: PersistOptions<PluginStore, SessionPersist> = {
  name: storeName,

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

export const usePluginStore = createWithEqualityFn<PluginStore>()(
  persist(
    devtools(createStore, {
      name: storeName + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  shallow,
);
