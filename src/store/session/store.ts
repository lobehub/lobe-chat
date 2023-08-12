import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { SessionStoreState, initialState } from './initialState';
import { AgentAction, createAgentSlice } from './slices/agentConfig';
import { ChatAction, createChatSlice } from './slices/chat';
import { SessionAction, createSessionSlice } from './slices/session';

//  ===============  聚合 createStoreFn ============ //

export type SessionStore = SessionAction & AgentAction & ChatAction & SessionStoreState;

const createStore: StateCreator<SessionStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createAgentSlice(...parameters),
  ...createSessionSlice(...parameters),
  ...createChatSlice(...parameters),
});

//  ===============  persist 本地缓存中间件配置 ============ //

type SessionPersist = Pick<SessionStore, 'sessions' | 'inbox'>;

const LOBE_CHAT = 'LOBE_CHAT';

const persistOptions: PersistOptions<SessionStore, SessionPersist> = {
  name: LOBE_CHAT,

  partialize: (s) => ({
    inbox: s.inbox,
    sessions: s.sessions,
  }),

  // 手动控制 Hydration ，避免 ssr 报错
  skipHydration: true,
  version: 0,
};

//  ===============  实装 useStore ============ //

export const useSessionStore = createWithEqualityFn<SessionStore>()(
  persist(
    devtools(createStore, {
      name: LOBE_CHAT + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  shallow,
);
