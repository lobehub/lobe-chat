import { t } from 'i18next';

import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR } from '@/const/meta';
import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig } from '@/types/session';

import { sessionSelectors } from '../session';
import { initialLobeAgentConfig } from './initialState';

const currentAgentMeta = (s: SessionStore): MetaData => {
  const session = sessionSelectors.currentSession(s);

  return { avatar: DEFAULT_AVATAR, backgroundColor: DEFAULT_BACKGROUND_COLOR, ...session?.meta };
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s)?.title || t('defaultSession');

const currentAgentBackgroundColor = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);
  if (!session) return DEFAULT_BACKGROUND_COLOR;
  return session.meta.backgroundColor || DEFAULT_BACKGROUND_COLOR;
};

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

const currentAgentSystemRole = (s: SessionStore) => {
  return currentAgentConfigSafe(s).systemRole;
};

const currentAgentModel = (s: SessionStore): LanguageModel => {
  const config = currentAgentConfig(s);

  return config?.model || LanguageModel.GPT3_5;
};

const hasSystemRole = (s: SessionStore) => {
  const config = currentAgentConfigSafe(s);

  return !!config.systemRole;
};

export const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
export const getTitle = (s: MetaData) => s.title || t('defaultSession');

export const agentSelectors = {
  currentAgentAvatar,
  currentAgentBackgroundColor,
  currentAgentConfig,
  currentAgentConfigSafe,
  currentAgentMeta,
  currentAgentModel,
  currentAgentSystemRole,
  currentAgentTitle,
  getAvatar,
  getTitle,
  hasSystemRole,
};
