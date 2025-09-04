import { LobeAgentSession, LobeSessionType } from '@lobechat/types';

import { DEFAULT_AGENT_META } from './meta';
import { DEFAULT_AGENT_CONFIG } from './settings';

export const INBOX_SESSION_ID = 'inbox';

export const WELCOME_GUIDE_CHAT_ID = 'welcome';

export const DEFAULT_AGENT_LOBE_SESSION: LobeAgentSession = {
  config: DEFAULT_AGENT_CONFIG,
  createdAt: new Date(),
  id: '',
  meta: DEFAULT_AGENT_META,
  model: DEFAULT_AGENT_CONFIG.model,
  type: LobeSessionType.Agent,
  updatedAt: new Date(),
};
