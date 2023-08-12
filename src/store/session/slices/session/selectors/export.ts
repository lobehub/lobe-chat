import { transform } from 'lodash-es';

import { SessionStore } from '@/store/session';
import { ConfigStateAgents, ConfigStateSessions } from '@/types/exportConfig';
import { LobeAgentSession, LobeSessions } from '@/types/session';

import { getSessionById } from './list';

export const exportSessions = (s: SessionStore): ConfigStateSessions => ({
  inbox: s.inbox,
  sessions: s.sessions,
});

export const exportAgents = (s: SessionStore): ConfigStateAgents => {
  return {
    sessions: transform(s.sessions, (result: LobeSessions, value, key) => {
      // 移除 chats 和 topics
      result[key] = { ...value, chats: {}, topics: {} } as LobeAgentSession;
    }),
  };
};

export const getExportAgent =
  (id: string) =>
  (s: SessionStore): LobeAgentSession => {
    const session = getSessionById(id)(s);
    return { ...session, chats: {}, topics: {} };
  };
