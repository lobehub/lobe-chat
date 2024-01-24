import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { SessionStoreState, initialState } from './initialState';
import { AgentAction, createAgentSlice } from './slices/agent/action';
import { SessionAction, createSessionSlice } from './slices/session/action';

//  ===============  聚合 createStoreFn ============ //

export type SessionStore = SessionAction & AgentAction & SessionStoreState;
const createStore: StateCreator<SessionStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createAgentSlice(...parameters),
  ...createSessionSlice(...parameters),
});

//  ===============  实装 useStore ============ //

export const useSessionStore = createWithEqualityFn<SessionStore>()(
  subscribeWithSelector(
    devtools(createStore, {
      name: 'LobeChat_Session' + (isDev ? '_DEV' : ''),
    }),
  ),
  shallow,
);
