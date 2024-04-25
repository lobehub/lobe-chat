import { VoiceList } from '@lobehub/tts';
import { t } from 'i18next';

import { DEFAULT_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import { DEFAULT_AGENT_CONFIG, DEFAUTT_AGENT_TTS_CONFIG } from '@/const/settings';
import { AgentStore } from '@/store/agent';
import { LobeAgentTTSConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

const isInboxSession = (s: AgentStore) => s.activeId === INBOX_SESSION_ID;

// ==========   Config   ============== //
const currentAgentConfig = (s: AgentStore) => merge(DEFAULT_AGENT_CONFIG, s.agentConfig);

const currentAgentSystemRole = (s: AgentStore) => {
  return currentAgentConfig(s).systemRole;
};

const currentAgentModel = (s: AgentStore): string => {
  const config = currentAgentConfig(s);

  return config?.model || 'gpt-3.5-turbo';
};

const currentAgentModelProvider = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return config?.provider;
};

const currentAgentPlugins = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return config?.plugins || [];
};

const currentAgentTTS = (s: AgentStore): LobeAgentTTSConfig => {
  const config = currentAgentConfig(s);

  return config?.tts || DEFAUTT_AGENT_TTS_CONFIG;
};

const currentAgentTTSVoice =
  (lang: string) =>
  (s: AgentStore): string => {
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

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
const getTitle = (s: MetaData) => s.title || t('defaultSession', { ns: 'common' });
export const getDescription = (s: MetaData) =>
  s.description || t('noDescription', { ns: 'common' });

const hasSystemRole = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return !!config.systemRole;
};

export const agentSelectors = {
  currentAgentConfig,
  currentAgentModel,
  currentAgentModelProvider,
  currentAgentPlugins,
  currentAgentSystemRole,
  currentAgentTTS,
  currentAgentTTSVoice,
  getAvatar,
  getDescription,
  getTitle,
  hasSystemRole,
  isInboxSession,
};
