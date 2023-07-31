import { t } from 'i18next';
import { defaults } from 'lodash-es';

import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR } from '@/const/meta';
import { Autocomplete } from '@/features/AgentSetting/AgentMeta';
import { SessionStore } from '@/store/session';
import { LanguageModel } from '@/types/llm';
import { MetaData } from '@/types/meta';

import { sessionSelectors } from '../session';
import { initialLobeAgentConfig } from './initialState';

const currentAgentMeta = (s: SessionStore): MetaData => {
  const session = sessionSelectors.currentSession(s);

  return { avatar: DEFAULT_AVATAR, backgroundColor: DEFAULT_BACKGROUND_COLOR, ...session?.meta };
};

const currentAutocomplete = (s: SessionStore): Autocomplete => ({
  autocompleteMeta: s.autocompleteMeta,
  autocompleteSessionAgentMeta: s.autocompleteSessionAgentMeta,
  id: s.activeId,
  loading: s.autocompleteLoading,
});

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s)?.title || t('defaultSession');

const currentAgentDescription = (s: SessionStore) =>
  currentAgentMeta(s)?.description || t('noDescription');

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
  return defaults(session?.config, initialLobeAgentConfig);
};

const currentAgentSystemRole = (s: SessionStore) => {
  return currentAgentConfig(s).systemRole;
};

const currentAgentModel = (s: SessionStore): LanguageModel => {
  const config = currentAgentConfig(s);

  return config?.model || LanguageModel.GPT3_5;
};

const hasSystemRole = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return !!config.systemRole;
};

export const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
export const getTitle = (s: MetaData) => s.title || t('defaultSession');

export const agentSelectors = {
  currentAgentAvatar,
  currentAgentBackgroundColor,
  currentAgentConfig,
  currentAgentDescription,
  currentAgentMeta,
  currentAgentModel,
  currentAgentSystemRole,
  currentAgentTitle,
  currentAutocomplete,
  getAvatar,
  getTitle,
  hasSystemRole,
};
