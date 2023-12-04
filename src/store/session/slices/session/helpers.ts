import { LobeAgentSession, LobeSessions, SessionGroupDefaultKeys } from '@/types/session';

import { initLobeSession } from './initialState';

export const getSessionPinned = (session: LobeAgentSession) =>
  session.group === SessionGroupDefaultKeys.Pinned;

const getSessionById = (id: string, sessions: LobeSessions): LobeAgentSession => {
  const session = sessions.find((s) => s.id === id);

  if (!session) return initLobeSession;

  return session;
};

export const sessionHelpers = {
  getSessionById,
  getSessionPinned,
};
