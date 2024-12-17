import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { createDevtools } from '../middleware/createDevtools';
import { type GlobalStoreAction, globalActionSlice } from './action';
import { type GlobalClientDBAction, clientDBSlice } from './actions/clientDb';
import { type GlobalState, initialState } from './initialState';

//  ===============  聚合 createStoreFn ============ //

export type GlobalStore = GlobalState & GlobalStoreAction & GlobalClientDBAction;

const createStore: StateCreator<GlobalStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...globalActionSlice(...parameters),
  ...clientDBSlice(...parameters),
});

//  ===============  实装 useStore ============ //

const devtools = createDevtools('global');

export const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  subscribeWithSelector(devtools(createStore)),
  shallow,
);
