import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import type { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { createDevtools } from '../middleware/createDevtools';
import { HomeStoreState, initialState } from './initialState';
import { AgentListAction, createAgentListSlice } from './slices/agentList/action';
import { HomeInputAction, createHomeInputSlice } from './slices/homeInput/action';
import { RecentAction, createRecentSlice } from './slices/recent/action';
import { SidebarUIAction, createSidebarUISlice } from './slices/sidebarUI/action';

//  ===============  Aggregate createStoreFn ============ //

export interface HomeStore
  extends AgentListAction, RecentAction, HomeInputAction, SidebarUIAction, HomeStoreState {}

const createStore: StateCreator<HomeStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createAgentListSlice(...parameters),
  ...createRecentSlice(...parameters),
  ...createHomeInputSlice(...parameters),
  ...createSidebarUISlice(...parameters),
});

//  ===============  Implement useStore ============ //
const devtools = createDevtools('home');

export const useHomeStore = createWithEqualityFn<HomeStore>()(
  subscribeWithSelector(
    devtools(createStore, {
      name: 'LobeChat_Home' + (isDev ? '_DEV' : ''),
    }),
  ),
  shallow,
);

export const getHomeStoreState = () => useHomeStore.getState();
