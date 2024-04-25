import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

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

//  ===============  实装 useStore ============ //

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  subscribeWithSelector(
    devtools(createStore, {
      name: 'LobeChat_Global' + (isDev ? '_DEV' : ''),
    }),
  ),
  shallow,
);
