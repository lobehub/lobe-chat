import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { LobeAgentConfig } from '@/types/session';

import { sessionSelectors } from '../session';
import { defaultAvatar, initialLobeAgentConfig } from './initialState';

const currentAgentTitle = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  return session?.meta.title;
};

const currentAgentAvatar = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  if (!session) return defaultAvatar;

  return session.meta.avatar || defaultAvatar;
};

const currentAgentConfig = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  return session?.config;
};

const currentAgentConfigSafe = (s: SessionStore): LobeAgentConfig => {
  return currentAgentConfig(s) || initialLobeAgentConfig;
};

const currentAgentModel = (s: SessionStore): LanguageModel => {
  const config = currentAgentConfig(s);

  return config?.model || LanguageModel.GPT3_5;
};

export const agentSelectors = {
  currentAgentAvatar,
  currentAgentConfig,
  currentAgentConfigSafe,
  currentAgentModel,
  currentAgentTitle,
};
