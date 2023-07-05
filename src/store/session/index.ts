import { create } from 'zustand';
import { PersistOptions, devtools, persist } from 'zustand/middleware';

import { Migration } from '@/migrations';

import { SessionStore, createStore } from './store';

type SessionPersist = Pick<SessionStore, 'sessions'>;

const persistOptions: PersistOptions<SessionStore, SessionPersist> = {
  migrate: (persistedState: any, version) => {
    const { state } = Migration.migrate({ state: persistedState, version });

    return { ...persistedState, ...state };
  },
  name: 'LOBE_CHAT',

  partialize: (s) => ({
    sessions: s.sessions,
  }),

  // 手动控制 Hydration ，避免 ssr 报错
  skipHydration: true,

  version: Migration.targetVersion,
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
