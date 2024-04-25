import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { SessionStoreState, initialState } from './initialState';
import { AgentChatAction, createChatSlice } from './slices/chat/action';

//  ===============  aggregate createStoreFn ============ //

export interface AgentStore extends AgentChatAction, SessionStoreState {}

const createStore: StateCreator<AgentStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createChatSlice(...parameters),
});

//  ===============  implement useStore ============ //

export const useAgentStore = createWithEqualityFn<AgentStore>()(
  devtools(createStore, {
    name: 'LobeChat_Agent' + (isDev ? '_DEV' : ''),
  }),
  shallow,
);
