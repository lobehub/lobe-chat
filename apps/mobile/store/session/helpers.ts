import { DEFAULT_AVATAR } from '@/mobile/const/meta';
import { DEFAULT_AGENT_LOBE_SESSION } from '@/mobile/const/session';
import { MetaData } from '@/mobile/types/meta';
import { LobeAgentSession, LobeSessions } from '@/mobile/types/session';

export const getSessionPinned = (session: LobeAgentSession) => session.pinned;

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
const getTitle = (s: MetaData) => s.title || '自定义助手';

const getSessionById = (id: string, sessions: LobeSessions): LobeAgentSession => {
  const session = sessions.find((s) => s.id === id);

  if (!session) return DEFAULT_AGENT_LOBE_SESSION;

  return session;
};

export const sessionHelpers = {
  getAvatar,
  getSessionById,
  getSessionPinned,
  getTitle,
};
