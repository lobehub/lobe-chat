import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { type UserState, initialState } from './initialState';
import { type UserAuthAction, createAuthSlice } from './slices/auth/action';
import { type CommonAction, createCommonSlice } from './slices/common/action';
import { type PreferenceAction, createPreferenceSlice } from './slices/preference/action';
import { type SettingsAction, createSettingsSlice } from './slices/settings/actions';
import { type SyncAction, createSyncSlice } from './slices/sync/action';

//  ===============  聚合 createStoreFn ============ //

export type UserStore = SyncAction &
  UserState &
  SettingsAction &
  PreferenceAction &
  UserAuthAction &
  CommonAction;

const createStore: StateCreator<UserStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createSyncSlice(...parameters),
  ...createSettingsSlice(...parameters),
  ...createPreferenceSlice(...parameters),
  ...createAuthSlice(...parameters),
  ...createCommonSlice(...parameters),
});

//  ===============  实装 useStore ============ //

export const useUserStore = createWithEqualityFn<UserStore>()(
  subscribeWithSelector(
    devtools(createStore, {
      name: 'LobeChat_User' + (isDev ? '_DEV' : ''),
    }),
  ),
  shallow,
);
