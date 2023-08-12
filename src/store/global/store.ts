import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { type GlobalState, initialState } from './initialState';
import { type AgentAction, createAgentSlice } from './slices/agent';
import { type CommonAction, createCommonSlice } from './slices/common';
import { type SettingsAction, createSettingsSlice } from './slices/settings';

//  ===============  聚合 createStoreFn ============ //

export type GlobalStore = CommonAction & GlobalState & AgentAction & SettingsAction;

const createStore: StateCreator<GlobalStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createCommonSlice(...parameters),
  ...createAgentSlice(...parameters),
  ...createSettingsSlice(...parameters),
});

//  ===============  persist 本地缓存中间件配置 ============ //
type GlobalPersist = Pick<GlobalStore, 'preference' | 'settings'>;

const persistOptions: PersistOptions<GlobalStore, GlobalPersist> = {
  name: 'LOBE_SETTINGS',
  partialize: (s) => ({
    preference: s.preference,
    settings: s.settings,
  }),
  skipHydration: true,
};

//  ===============  实装 useStore ============ //

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  persist(
    devtools(createStore, {
      name: 'LOBE_GLOBAL' + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  shallow,
);
