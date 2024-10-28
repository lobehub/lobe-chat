import { t } from 'i18next';

import { DEFAULT_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_LOBE_SESSION } from '@/const/session';
import { MetaData } from '@/types/meta';
import { LobeAgentSession, LobeSessions } from '@/types/session';

export const getSessionPinned = (session: LobeAgentSession) => session.pinned;

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
const getTitle = (s: MetaData) => s.title || t('defaultSession', { ns: 'common' });

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
