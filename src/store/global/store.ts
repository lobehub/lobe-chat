import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { type AppSettingsState, initialState } from './initialState';
import { type AgentAction, createAgentSlice } from './slices/agent';
import { type CommonAction, createCommonSlice } from './slices/common';

//  ===============  聚合 createStoreFn ============ //

export type GlobalStore = CommonAction & AppSettingsState & AgentAction;

const createStore: StateCreator<GlobalStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createCommonSlice(...parameters),
  ...createAgentSlice(...parameters),
});

//  ===============  persist 本地缓存中间件配置 ============ //

const LOBE_SETTINGS = 'LOBE_SETTINGS';

const persistOptions: PersistOptions<GlobalStore> = {
  name: LOBE_SETTINGS,
  skipHydration: true,
};

//  ===============  实装 useStore ============ //

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  persist(
    devtools(createStore, {
      name: LOBE_SETTINGS + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  shallow,
);
