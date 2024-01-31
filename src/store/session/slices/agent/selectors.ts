import { VoiceList } from '@lobehub/tts';
import { t } from 'i18next';

import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG, DEFAUTT_AGENT_TTS_CONFIG } from '@/const/settings';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';
import { SessionStore } from '@/store/session';
import { LobeAgentTTSConfig } from '@/types/agent';
import { LanguageModel } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import { sessionSelectors } from '../session/selectors';

// ==========   Config   ============== //
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

const currentAgentModel = (s: SessionStore): LanguageModel | string => {
  const config = currentAgentConfig(s);

  return config?.model || LanguageModel.GPT3_5;
};

const currentAgentModelProvider = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return config?.provider;
};

const currentAgentPlugins = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return config?.plugins || [];
};

const currentAgentTTS = (s: SessionStore): LobeAgentTTSConfig => {
  const config = currentAgentConfig(s);

  return config?.tts || DEFAUTT_AGENT_TTS_CONFIG;
};

const currentAgentTTSVoice =
  (lang: string) =>
  (s: SessionStore): string => {
    const { voice, ttsService } = currentAgentTTS(s);
    const voiceList = new VoiceList(lang);
    let currentVoice;
    switch (ttsService) {
      case 'openai': {
        currentVoice = voice.openai || (VoiceList.openaiVoiceOptions?.[0].value as string);
        break;
      }
      case 'edge': {
        currentVoice = voice.edge || (voiceList.edgeVoiceOptions?.[0].value as string);
        break;
      }
      case 'microsoft': {
        currentVoice = voice.microsoft || (voiceList.microsoftVoiceOptions?.[0].value as string);
        break;
      }
    }
    return currentVoice || 'alloy';
  };

// ==========   Meta   ============== //
const currentAgentMeta = (s: SessionStore): MetaData => {
  const isInbox = sessionSelectors.isInboxSession(s);

  const defaultMeta = {
    avatar: isInbox ? DEFAULT_INBOX_AVATAR : DEFAULT_AVATAR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    description: isInbox
      ? t('inbox.desc', { ns: 'chat' })
      : currentAgentSystemRole(s) || t('noDescription'),
    title: isInbox ? t('inbox.title', { ns: 'chat' }) : t('defaultSession'),
  };

  const session = sessionSelectors.currentSession(s);

  return merge(defaultMeta, session?.meta);
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s).title;
const currentAgentDescription = (s: SessionStore) => currentAgentMeta(s).description;
const currentAgentAvatar = (s: SessionStore) => currentAgentMeta(s).avatar;
const currentAgentBackgroundColor = (s: SessionStore) => currentAgentMeta(s).backgroundColor;

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
const getTitle = (s: MetaData) => s.title || t('defaultSession', { ns: 'common' });
export const getDescription = (s: MetaData) =>
  s.description || t('noDescription', { ns: 'common' });

const hasSystemRole = (s: SessionStore) => {
  const config = currentAgentConfig(s);

  return !!config.systemRole;
};

export const agentSelectors = {
  currentAgentAvatar,
  currentAgentBackgroundColor,
  currentAgentConfig,
  currentAgentDescription,
  currentAgentMeta,
  currentAgentModel,
  currentAgentModelProvider,
  currentAgentPlugins,
  currentAgentSystemRole,
  currentAgentTTS,
  currentAgentTTSVoice,
  currentAgentTitle,
  getAvatar,
  getDescription,
  getTitle,
  hasSystemRole,
};
