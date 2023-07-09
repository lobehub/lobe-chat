import { SessionStore } from '@/store/session';

import { LanguageModel } from '@/types/llm';
import { sessionSelectors } from '../session';

const currentAgentTitle = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  return session?.meta.title;
};

const currentAgentAvatar = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  const defaultAvatar = 'https://npm.elemecdn.com/@lobehub/assets-logo/assets/logo-3d.webp';
  if (!session) return defaultAvatar;

  return session.meta.avatar || defaultAvatar;
};

const currentAgentConfig = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  return session?.config;
};

const currentAgentModel = (s: SessionStore): LanguageModel => {
  const config = currentAgentConfig(s);

  return config?.model || LanguageModel.GPT3_5;
};

export const agentSelectors = {
  currentAgentConfig,
  currentAgentAvatar,
  currentAgentModel,
  currentAgentTitle,
};
