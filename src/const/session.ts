import { DEFAULT_AGENT_META, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentSession, LobeSessionType } from '@/types/session';
import { merge } from '@/utils/merge';

export const INBOX_SESSION_ID = 'inbox';

export const DEFAULT_AGENT_LOBE_SESSION: LobeAgentSession = {
  chats: {},
  config: DEFAULT_AGENT_CONFIG,
  createdAt: Date.now(),
  files: [],
  id: '',
  messages: [],
  meta: DEFAULT_AGENT_META,
  topics: [],
  type: LobeSessionType.Agent,
  updatedAt: Date.now(),
};

export const DEFAULT_INBOX_SESSION: LobeAgentSession = merge(DEFAULT_AGENT_LOBE_SESSION, {
  id: 'inbox',
  meta: {
    avatar: DEFAULT_INBOX_AVATAR,
  },
});
