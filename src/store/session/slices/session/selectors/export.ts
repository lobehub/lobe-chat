import { transform } from 'lodash-es';

import { SessionStore } from '@/store/session';
import { ConfigStateAgents, ConfigStateSessions } from '@/types/exportConfig';
import { LobeAgentSession, LobeSessions } from '@/types/session';

import { sessionHelpers } from '../helpers';

const exportSessions = (s: SessionStore): Pick<ConfigStateSessions, 'sessions'> => ({
  sessions: s.sessions,
});

const exportAgents = (s: SessionStore): ConfigStateAgents => {
  return {
    sessions: transform(s.sessions, (result: LobeSessions, value, key) => {
      // 移除 chats 和 topics
      result[key] = { ...value, chats: {}, topics: {} } as LobeAgentSession;
    }),
  };
};

const getExportAgent =
  (id: string) =>
  (s: SessionStore): LobeAgentSession =>
    sessionHelpers.getSessionById(id, s.sessions);

export const sessionExportSelectors = {
  exportAgents,
  exportSessions,
  getExportAgent,
};
