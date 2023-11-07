import { INBOX_SESSION_ID } from '@/const/session';
import { SessionStore } from '@/store/session';

import { exportAgents, exportSessions, getExportAgent } from './export';
import {
  currentSession,
  currentSessionSafe,
  getSessionById,
  getSessionMetaById,
  hasConversion,
  hasPinnedSessionList,
  hasSessionList,
  pinnedSessionList,
  sessionList,
  unpinnedSessionList,
} from './list';

const isInboxSession = (s: SessionStore) => s.activeId === INBOX_SESSION_ID;

export const sessionSelectors = {
  currentSession,
  currentSessionSafe,
  exportAgents,
  exportSessions,
  getExportAgent,
  getSessionById,
  getSessionMetaById,
  hasConversion,
  hasPinnedSessionList,
  hasSessionList,
  isInboxSession,
  pinnedSessionList,
  sessionList,
  unpinnedSessionList,
};
