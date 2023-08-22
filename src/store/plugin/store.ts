import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { PluginAction, createPluginSlice } from './action';
import { PluginStoreState, initialState } from './initialState';

//  ===============  聚合 createStoreFn ============ //

export type PluginStore = PluginStoreState & PluginAction;

const createStore: StateCreator<PluginStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createPluginSlice(...parameters),
});

//  ===============  persist 本地缓存中间件配置 ============ //

type SessionPersist = Pick<PluginStore, 'pluginList'>;

const storeName = 'LOBE_PLUGIN';

const persistOptions: PersistOptions<PluginStore, SessionPersist> = {
  name: storeName,

  partialize: (s) => ({
    pluginList: s.pluginList,
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
