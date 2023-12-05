import { INBOX_SESSION_ID } from '@/const/session';
import { sessionHelpers } from '@/store/session/slices/session/helpers';
import { MetaData } from '@/types/meta';
import { LobeAgentSession, LobeSessions, SessionGroupDefaultKeys } from '@/types/session';

import { SessionStore } from '../../../store';
import { initLobeSession } from '../initialState';

const defaultSessions = (s: SessionStore): LobeSessions => s.sessions;

const searchSessions = (s: SessionStore): LobeSessions => s.searchSessions;

const pinnedSessionList = (s: SessionStore) =>
  defaultSessions(s).filter((s) => s.group === SessionGroupDefaultKeys.Pinned);

const unpinnedSessionList = (s: SessionStore) =>
  defaultSessions(s).filter((s) => s.group === SessionGroupDefaultKeys.Default);

const getSessionById =
  (id: string) =>
  (s: SessionStore): LobeAgentSession =>
    sessionHelpers.getSessionById(id, s.sessions);

const getSessionMetaById =
  (id: string) =>
  (s: SessionStore): MetaData => {
    const session = getSessionById(id)(s);

    if (!session) return {};
    return session.meta;
  };

const currentSession = (s: SessionStore): LobeAgentSession | undefined => {
  if (!s.activeId) return;

  return s.sessions.find((i) => i.id === s.activeId);
};

const currentSessionSafe = (s: SessionStore): LobeAgentSession => {
  return currentSession(s) || initLobeSession;
};

const hasPinnedSessionList = (s: SessionStore) => {
  const list = pinnedSessionList(s);
  return list?.length > 0;
};

const hasCustomAgents = (s: SessionStore) => defaultSessions(s).length > 0;

const isInboxSession = (s: SessionStore) => s.activeId === INBOX_SESSION_ID;

export const sessionSelectors = {
  currentSession,
  currentSessionSafe,
  getSessionById,
  getSessionMetaById,
  hasCustomAgents,
  hasPinnedSessionList,
  isInboxSession,
  pinnedSessionList,
  searchSessions,
  unpinnedSessionList,
};
