import { t } from 'i18next';

import { DEFAULT_OPENAI_MODEL_LIST } from '@/const/llm';
import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR } from '@/const/meta';
import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import { sessionSelectors } from '../session/selectors';
import { initialLobeAgentConfig } from './initialState';

const currentAgentMeta = (s: SessionStore): MetaData => {
  const session = sessionSelectors.currentSession(s);

  return { avatar: DEFAULT_AVATAR, backgroundColor: DEFAULT_BACKGROUND_COLOR, ...session?.meta };
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s)?.title || t('defaultSession');

const currentAgentConfig = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);
  return merge(initialLobeAgentConfig, session?.config);
};

const currentAgentSystemRole = (s: SessionStore) => {
  return currentAgentConfig(s).systemRole;
};

const currentAgentDescription = (s: SessionStore) =>
  currentAgentMeta(s)?.description || currentAgentSystemRole(s) || t('noDescription');

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

const currentAgentModel = (s: SessionStore): LanguageModel | string => {
  const config = currentAgentConfig(s);

  return config?.model || LanguageModel.GPT3_5;
};

const currentAgentPlugins = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return config?.plugins || [];
};

const hasSystemRole = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return !!config.systemRole;
};

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
const getTitle = (s: MetaData) => s.title || t('defaultSession', { ns: 'common' });

export const getDescription = (s: MetaData) =>
  s.description || t('noDescription', { ns: 'common' });

const showTokenTag = (s: SessionStore) => {
  const model = currentAgentModel(s);

  return DEFAULT_OPENAI_MODEL_LIST.includes(model);
};

export const agentSelectors = {
  currentAgentAvatar,
  currentAgentBackgroundColor,
  currentAgentConfig,
  currentAgentDescription,
  currentAgentMeta,
  currentAgentModel,
  currentAgentPlugins,
  currentAgentSystemRole,
  currentAgentTitle,
  getAvatar,
  getDescription,
  getTitle,
  hasSystemRole,
  showTokenTag,
};
