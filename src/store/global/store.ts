import { PersistOptions, devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { createHyperStorage } from '../middleware/createHyperStorage';
import { type GlobalState, initialState } from './initialState';
import { type CommonAction, createCommonSlice } from './slices/common/action';
import { type PreferenceAction, createPreferenceSlice } from './slices/preference/action';
import { type SettingsAction, createSettingsSlice } from './slices/settings/actions';

//  ===============  聚合 createStoreFn ============ //

export type GlobalStore = CommonAction & GlobalState & SettingsAction & PreferenceAction;

const createStore: StateCreator<GlobalStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createCommonSlice(...parameters),
  ...createSettingsSlice(...parameters),
  ...createPreferenceSlice(...parameters),
});

//  ===============  persist 本地缓存中间件配置 ============ //
type GlobalPersist = Pick<GlobalStore, 'preference' | 'settings'>;

const persistOptions: PersistOptions<GlobalStore, GlobalPersist> = {
  name: 'LOBE_GLOBAL',

  skipHydration: true,

  storage: createHyperStorage({
    localStorage: {
      dbName: 'LobeHub',
      selectors: ['preference'],
    },
  }),
};

//  ===============  实装 useStore ============ //

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  persist(
    subscribeWithSelector(
      devtools(createStore, {
        name: 'LobeChat_Global' + (isDev ? '_DEV' : ''),
      }),
    ),
    persistOptions,
  ),
  shallow,
);
