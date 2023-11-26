import { t } from 'i18next';

import { DEFAULT_OPENAI_MODEL_LIST, VISION_MODEL_WHITE_LIST } from '@/const/llm';
import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG, DEFAUTT_AGENT_TTS_CONFIG } from '@/const/settings';
import { settingsSelectors, useGlobalStore } from '@/store/global';
import { SessionStore } from '@/store/session';
import { LobeAgentTTSConfig } from '@/types/agent';
import { LanguageModel } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import { sessionSelectors } from '../session/selectors';

const currentAgentMeta = (s: SessionStore): MetaData => {
  const session = sessionSelectors.currentSession(s);

  return { avatar: DEFAULT_AVATAR, backgroundColor: DEFAULT_BACKGROUND_COLOR, ...session?.meta };
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s)?.title || t('defaultSession');

const currentAgentConfig = (s: SessionStore) => {
  const session = sessionSelectors.currentSession(s);

  // if is the inbox session, use the default agent config in global store
  if (sessionSelectors.isInboxSession(s)) {
    return settingsSelectors.defaultAgentConfig(useGlobalStore.getState());
  }

  return merge(DEFAULT_AGENT_CONFIG, session?.config);
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

const modelHasVisionAbility = (s: SessionStore): boolean => {
  const model = currentAgentModel(s);
  return VISION_MODEL_WHITE_LIST.includes(model);
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

const currentAgentTTS = (s: SessionStore): LobeAgentTTSConfig => {
  const config = currentAgentConfig(s);

  return config?.tts || DEFAUTT_AGENT_TTS_CONFIG;
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
  currentAgentTTS,
  currentAgentTitle,
  getAvatar,
  getDescription,
  getTitle,
  hasSystemRole,
  modelHasVisionAbility,
  showTokenTag,
};
