import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { type GlobalStoreAction, globalActionSlice } from './action';
import { type GlobalState, initialState } from './initialState';

//  ===============  聚合 createStoreFn ============ //

export type GlobalStore = GlobalState & GlobalStoreAction;

const createStore: StateCreator<GlobalStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...globalActionSlice(...parameters),
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
