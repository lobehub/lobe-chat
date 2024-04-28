import { DEFAULT_AGENT_LOBE_SESSION } from '@/const/session';
import { LobeAgentSession, LobeSessions } from '@/types/session';

export const getSessionPinned = (session: LobeAgentSession) => session.pinned;

const getSessionById = (id: string, sessions: LobeSessions): LobeAgentSession => {
  const session = sessions.find((s) => s.id === id);

  if (!session) return DEFAULT_AGENT_LOBE_SESSION;

  return session;
};

export const sessionHelpers = {
  getSessionById,
  getSessionPinned,
};
