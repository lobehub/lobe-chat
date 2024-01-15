import { INBOX_SESSION_ID } from '@/const/session';
import { groupHelpers } from '@/store/global/helpers';
import { sessionHelpers } from '@/store/session/slices/session/helpers';
import { MetaData } from '@/types/meta';
import {
  LobeAgentSession,
  LobeSessions,
  SessionDefaultGroup,
  SessionGroupItem,
} from '@/types/session';

import { SessionStore } from '../../../store';
import { initLobeSession } from '../initialState';

const defaultSessions = (s: SessionStore): LobeSessions => s.sessions;

const searchSessions = (s: SessionStore): LobeSessions => s.searchSessions;

const sessionList = (sessionCustomGroups: SessionGroupItem[]) => (s: SessionStore) => {
  const customList: Record<string, LobeAgentSession[]> = {};
  const defaultList: LobeAgentSession[] = [];
  const pinnedList: LobeAgentSession[] = [];

  for (const session of defaultSessions(s)) {
    if (!session.group || session.group === SessionDefaultGroup.Default) {
      defaultList.push(session);
    } else if (session.group === SessionDefaultGroup.Pinned) {
      pinnedList.push(session);
    } else {
      const group = groupHelpers.getGroupById(session.group, sessionCustomGroups);
      if (!group) {
        s.updateSessionGroup(session.id, SessionDefaultGroup.Default);
        defaultList.push(session);
        continue;
      }
      customList[session.group] = customList[session.group] || [];
      customList[session.group].push(session);
    }
  }

  return {
    customList,
    defaultList,
    pinnedList,
  };
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

const hasCustomAgents = (s: SessionStore) => defaultSessions(s).length > 0;

const isInboxSession = (s: SessionStore) => s.activeId === INBOX_SESSION_ID;

const isSessionListInit = (s: SessionStore) => s.isSessionsFirstFetchFinished;

// use to judge whether a session is fully activated
const isSomeSessionActive = (s: SessionStore) => !!s.activeId && isSessionListInit(s);

export const sessionSelectors = {
  currentSession,
  currentSessionSafe,
  getSessionById,
  getSessionMetaById,
  hasCustomAgents,
  isInboxSession,
  isSessionListInit,
  isSomeSessionActive,
  searchSessions,
  sessionList,
};
