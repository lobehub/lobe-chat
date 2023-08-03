import equal from 'fast-deep-equal';
import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { createWithEqualityFn } from 'zustand/traditional';

import { isDev } from '@/utils/env';

import { SessionStore, createStore } from './store';

type SessionPersist = Pick<SessionStore, 'sessions'>;

export const LOBE_CHAT = 'LOBE_CHAT';

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

export * from './selectors';
export { initialLobeAgentConfig } from './slices/agentConfig';
export { initLobeSession } from './slices/session';
export type { SessionStore } from './store';
