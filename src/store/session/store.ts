import equal from 'fast-deep-equal';
import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { SessionStoreState, initialState } from './initialState';
import { AgentAction, createAgentSlice } from './slices/agentConfig';
import { ChatAction, createChatSlice } from './slices/chat';
import { SessionAction, createSessionSlice } from './slices/session';

export type SessionStore = SessionAction & AgentAction & ChatAction & SessionStoreState;

const createStore: StateCreator<SessionStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createAgentSlice(...parameters),
  ...createSessionSlice(...parameters),
  ...createChatSlice(...parameters),
});

type SessionPersist = Pick<SessionStore, 'sessions'>;

const LOBE_CHAT = 'LOBE_CHAT';

const persistOptions: PersistOptions<SessionStore, SessionPersist> = {
  name: LOBE_CHAT,

  partialize: (s) => ({
    sessions: s.sessions,
  }),

  // 手动控制 Hydration ，避免 ssr 报错
  skipHydration: true,
  version: 0,
  // version: Migration.targetVersion,
};

export const useSessionStore = createWithEqualityFn<SessionStore>()(
  persist(
    devtools(createStore, {
      name: LOBE_CHAT + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  equal,
);
