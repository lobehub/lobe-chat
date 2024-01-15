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

const customSessionGroup = (s: SessionStore) => {
  const group2SessionList: Record<string, LobeAgentSession[]> = {};
  // 1. 筛选用户自定义的session
  const customList = defaultSessions(s).filter(
    (s) =>
      s.group !== SessionGroupDefaultKeys.Pinned && s.group !== SessionGroupDefaultKeys.Default,
  );
  // 2. 进行分组
  for (const s of customList) {
    if (!s.group) continue;
    group2SessionList[s.group] = group2SessionList[s.group] || [];
    group2SessionList[s.group].push(s);
  }
  return group2SessionList;
};

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

const isSessionListInit = (s: SessionStore) => s.isSessionsFirstFetchFinished;

// use to judge whether a session is fully activated
const isSomeSessionActive = (s: SessionStore) => !!s.activeId && isSessionListInit(s);

export const sessionSelectors = {
  currentSession,
  currentSessionSafe,
  customSessionGroup,
  getSessionById,
  getSessionMetaById,
  hasCustomAgents,
  hasPinnedSessionList,
  isInboxSession,
  isSessionListInit,
  isSomeSessionActive,
  pinnedSessionList,
  searchSessions,
  unpinnedSessionList,
};
