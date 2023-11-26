import { INBOX_SESSION_ID } from '@/const/session';
import { MetaData } from '@/types/meta';
import { LobeAgentSession, LobeSessions, SessionGroupDefaultKeys } from '@/types/session';

import { SessionStore } from '../../../store';
import { initInboxSession, initLobeSession } from '../initialState';

export const inboxSession = (s: SessionStore): LobeAgentSession =>
  s.sessions.find((i) => i.id === INBOX_SESSION_ID) || initInboxSession;

export const customAgentSessions = (s: SessionStore): LobeSessions =>
  s.sessions.filter((s) => s.id !== INBOX_SESSION_ID);

export const pinnedSessionList = (s: SessionStore) =>
  customAgentSessions(s).filter((s) => s.group === SessionGroupDefaultKeys.Pinned);

export const unpinnedSessionList = (s: SessionStore) =>
  customAgentSessions(s).filter((s) => s.group === SessionGroupDefaultKeys.Default);

export const getSessionById =
  (id: string) =>
  (s: SessionStore): LobeAgentSession => {
    const session = s.sessions.find((s) => s.id === id);

    if (!session) return initLobeSession;

    return session;
  };

export const getSessionMetaById =
  (id: string) =>
  (s: SessionStore): MetaData => {
    const session = getSessionById(id)(s);

    if (!session) return {};
    return session.meta;
  };

export const currentSession = (s: SessionStore): LobeAgentSession | undefined => {
  if (!s.activeId) return;

  return s.sessions.find((i) => i.id === s.activeId);
};

export const currentSessionSafe = (s: SessionStore): LobeAgentSession => {
  return currentSession(s) || initLobeSession;
};

export const hasPinnedSessionList = (s: SessionStore) => {
  const list = pinnedSessionList(s);
  return list?.length > 0;
};

export const hasConversion = (s: SessionStore) => {
  // TODO: 补回 inbox message数量大于0 的逻辑
  return customAgentSessions(s).length > 0;
};
