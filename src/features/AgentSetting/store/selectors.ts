import { DEFAULT_AGENT_CHAT_CONFIG } from '@/const/settings';
import { LobeAgentChatConfig } from '@/types/agent';

import { Store } from './action';

const chatConfig = (s: Store): LobeAgentChatConfig =>
  s.config.chatConfig || DEFAULT_AGENT_CHAT_CONFIG;

export const DEFAULT_OPENING_QUESTIONS: string[] = [];
export const selectors = {
  chatConfig,
  openingMessage: (s: Store) => s.config.openingMessage,
  openingQuestions: (s: Store) => s.config.openingQuestions || DEFAULT_OPENING_QUESTIONS,
};
