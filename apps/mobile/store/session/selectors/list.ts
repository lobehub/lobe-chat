import { DEFAULT_AGENT_LOBE_SESSION, INBOX_SESSION_ID } from '@/mobile/const/session';
import { MetaData } from '@/mobile/types/meta';
import { LobeAgentSession, LobeSessions } from '@/mobile/types/session';

import { sessionHelpers } from '../helpers';
import { SessionStore } from '../index';

const allSessions = (s: SessionStore): LobeSessions => s.sessions;

const getSessionById =
  (id: string) =>
  (s: SessionStore): LobeAgentSession =>
    sessionHelpers.getSessionById(id, allSessions(s));

const getSessionMetaById =
  (id: string) =>
  (s: SessionStore): MetaData => {
    const session = getSessionById(id)(s);

    if (!session) return {};
    return session.meta;
  };

const currentSession = (s: SessionStore): LobeAgentSession | undefined => {
  if (!s.activeId) return;

  return allSessions(s).find((i) => i.id === s.activeId);
};

const currentSessionSafe = (s: SessionStore): LobeAgentSession => {
  return currentSession(s) || DEFAULT_AGENT_LOBE_SESSION;
};

const isInboxSession = (s: SessionStore) => s.activeId === INBOX_SESSION_ID;

export const sessionSelectors = {
  currentSession,
  currentSessionSafe,
  getSessionById,
  getSessionMetaById,
  isInboxSession,
};
