import { INBOX_SESSION_ID } from '@/const/session';
import { sessionHelpers } from '@/store/session/slices/session/helpers';
import { MetaData } from '@/types/meta';
import { CustomSessionGroup, LobeAgentSession, LobeSessions } from '@/types/session';

import { SessionStore } from '../../../store';
import { initLobeSession } from '../initialState';

const defaultSessions = (s: SessionStore): LobeSessions => s.defaultSessions;
const pinnedSessions = (s: SessionStore): LobeSessions => s.pinnedSessions;
const customSessionGroups = (s: SessionStore): CustomSessionGroup[] => s.customSessionGroups;

const allSessions = (s: SessionStore): LobeSessions => s.sessions;

const searchSessions = (s: SessionStore): LobeSessions => s.searchSessions;

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
  return currentSession(s) || initLobeSession;
};

const hasCustomAgents = (s: SessionStore) => defaultSessions(s).length > 0;

const isInboxSession = (s: SessionStore) => s.activeId === INBOX_SESSION_ID;

const isSessionListInit = (s: SessionStore) => s.isSessionsFirstFetchFinished;

// use to judge whether a session is fully activated
const isSomeSessionActive = (s: SessionStore) => !!s.activeId && isSessionListInit(s);

export const sessionSelectors = {
  currentSession,
  currentSessionSafe,
  customSessionGroups,
  defaultSessions,
  getSessionById,
  getSessionMetaById,
  hasCustomAgents,
  isInboxSession,
  isSessionListInit,
  isSomeSessionActive,
  pinnedSessions,
  searchSessions,
};
