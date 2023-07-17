import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig } from '@/types/session';

import { sessionSelectors } from '../session';
import { DEFAULT_AVATAR, initialLobeAgentConfig } from './initialState';

const currentAgentMeta = (s: SessionStore): MetaData => {
  const session = sessionSelectors.currentSession(s);

  return session?.meta || {};
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s)?.title;

const currentAgentAvatar = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  if (!session) return DEFAULT_AVATAR;

  return session.meta.avatar || DEFAULT_AVATAR;
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

const hasSystemRole = (s: SessionStore) => {
  const config = currentAgentConfigSafe(s);

  return !!config.systemRole;
};
export const agentSelectors = {
  currentAgentAvatar,
  currentAgentConfig,
  currentAgentConfigSafe,
  currentAgentMeta,
  currentAgentModel,
  currentAgentTitle,
  hasSystemRole,
};
