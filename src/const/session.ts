import { DEFAULT_AGENT_META, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentSession, LobeSessionType } from '@/types/session';
import { merge } from '@/utils/merge';

export const INBOX_SESSION_ID = 'inbox';

export const WELCOME_GUIDE_CHAT_ID = 'welcome';

export const DEFAULT_AGENT_LOBE_SESSION: LobeAgentSession = {
  config: DEFAULT_AGENT_CONFIG,
  createdAt: Date.now(),
  id: '',
  meta: DEFAULT_AGENT_META,
  model: DEFAULT_AGENT_CONFIG.model,
  type: LobeSessionType.Agent,
  updatedAt: Date.now(),
};

export const DEFAULT_INBOX_SESSION: LobeAgentSession = merge(DEFAULT_AGENT_LOBE_SESSION, {
  id: 'inbox',
  meta: {
    avatar: DEFAULT_INBOX_AVATAR,
  },
});
