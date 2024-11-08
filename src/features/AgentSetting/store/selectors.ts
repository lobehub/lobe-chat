import { DEFAULT_AGENT_CHAT_CONFIG } from '@/const/settings';
import { LobeAgentChatConfig } from '@/types/agent';

import { Store } from './action';

const chatConfig = (s: Store): LobeAgentChatConfig =>
  s.config.chatConfig || DEFAULT_AGENT_CHAT_CONFIG;

export const selectors = {
  chatConfig,
};
