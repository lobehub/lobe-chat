import { LobeAgentSession, LobeSessionType } from '@lobechat/types';
import dayjs from 'dayjs';

import { DEFAULT_AGENT_META, DEFAULT_INBOX_AVATAR } from '@/_const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/_const/settings';
import { merge } from '@/utils/merge';

export const INBOX_SESSION_ID = 'inbox';

export const WELCOME_GUIDE_CHAT_ID = 'welcome';

export const DEFAULT_AGENT_LOBE_SESSION: LobeAgentSession = {
  config: DEFAULT_AGENT_CONFIG,
  createdAt: dayjs().toDate(),
  id: '',
  meta: DEFAULT_AGENT_META,
  model: DEFAULT_AGENT_CONFIG.model,
  type: LobeSessionType.Agent,
  updatedAt: dayjs().toDate(),
};

export const DEFAULT_INBOX_SESSION: LobeAgentSession = merge(DEFAULT_AGENT_LOBE_SESSION, {
  id: 'inbox',
  meta: {
    avatar: DEFAULT_INBOX_AVATAR,
  },
});
