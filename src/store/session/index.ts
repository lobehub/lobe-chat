import { create } from 'zustand';
import { PersistOptions, devtools, persist } from 'zustand/middleware';

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

export const useSessionStore = create<SessionStore>()(
  persist(
    devtools(createStore, {
      name: LOBE_CHAT,
    }),
    persistOptions,
  ),
);

export * from './selectors';
export type { SessionStore } from './store';
