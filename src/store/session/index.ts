import { create } from 'zustand';
import { devtools, persist, PersistOptions } from 'zustand/middleware';

import { Migration } from '@/migrations';

import { createStore, SessionStore } from './store';

type SessionPersist = Pick<SessionStore, 'sessions'>;

const persistOptions: PersistOptions<SessionStore, SessionPersist> = {
  name: 'LOBE_CHAT',
  version: Migration.targetVersion,

  partialize: (s) => ({
    sessions: s.sessions,
  }),

  migrate: (persistedState: any, version) => {
    const { state } = Migration.migrate({ state: persistedState, version });

    return { ...persistedState, ...state };
  },
  // 手动控制 Hydration ，避免 ssr 报错
  skipHydration: true,
};

export const useChatStore = create<SessionStore>()(
  persist(
    devtools(createStore, {
      name: 'LOBE_CHATS',
    }),
    persistOptions,
  ),
);

export * from './selectors';
export type { SessionStore } from './store';
