import { transform } from 'lodash-es';

import { SessionStore } from '@/store/session';
import { LobeAgentSession, LobeSessions } from '@/types/session';

import { getSessionById } from './list';

export const exportSessions = (s: SessionStore) => s.sessions;

// 排除 chats
export const exportAgents = (s: SessionStore) => {
  return transform(s.sessions, (result: LobeSessions, value, key) => {
    // 移除 chats 和 topics
    result[key] = { ...value, chats: {}, topics: {} } as LobeAgentSession;
  });
};
// 排除 chats
export const getExportAgent =
  (id: string) =>
  (s: SessionStore): LobeAgentSession => {
    const session = getSessionById(id)(s);
    return { ...session, chats: {}, topics: {} };
  };
