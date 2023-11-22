import { INBOX_SESSION_ID } from '@/const/session';
import { MetaData } from '@/types/meta';
import { LobeAgentSession, SessionGroupDefaultKeys } from '@/types/session';

import { SessionStore } from '../../../store';
import { initLobeSession } from '../initialState';

export const pinnedSessionList = (s: SessionStore) =>
  s.sessions.filter((s) => s.group === SessionGroupDefaultKeys.Pinned);

export const unpinnedSessionList = (s: SessionStore) =>
  s.sessions.filter((s) => s.group === SessionGroupDefaultKeys.Default);

export const hasPinnedSessionList = (s: SessionStore) => {
  const list = pinnedSessionList(s);
  return list?.length > 0;
};

export const getSessionById =
  (id: string) =>
  (s: SessionStore): LobeAgentSession => {
    if (id === INBOX_SESSION_ID) return s.inbox;

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

export const hasConversion = (s: SessionStore) => {
  const hasCustomAgents = s.sessions.length > 0;
  const hasMessageInInbox = !!Object.keys(s.inbox.chats).length;

  return hasCustomAgents || hasMessageInInbox;
};

export const currentSession = (s: SessionStore): LobeAgentSession | undefined => {
  if (!s.activeId) return;

  if (s.activeId === INBOX_SESSION_ID) return s.inbox;

  return s.sessions.find((i) => i.id === s.activeId);
};

export const currentSessionSafe = (s: SessionStore): LobeAgentSession => {
  return currentSession(s) || initLobeSession;
};
