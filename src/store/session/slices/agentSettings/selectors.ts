import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';

import { sessionSelectors } from '../session';

const currentAgentTitleSel = (s: SessionStore) => {
  const session = sessionSelectors.currentChat(s);

  return session?.meta.title;
};

const currentAgentConfig = (s: SessionStore) => {
  const session = sessionSelectors.currentChat(s);

  return session?.config;
};

const currentAgentModel = (s: SessionStore): LanguageModel => {
  const config = currentAgentConfig(s);

  return config?.model || LanguageModel.GPT3_5;
};

export const agentSelectors = {
  currentAgentConfig,
  currentAgentModel,
  currentAgentSlicedTitle: currentAgentTitleSel,
};
