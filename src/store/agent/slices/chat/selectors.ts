import { VoiceList } from '@lobehub/tts';

import { INBOX_SESSION_ID } from '@/const/session';
import {
  DEFAULT_AGENT_CHAT_CONFIG,
  DEFAULT_AGENT_CONFIG,
  DEFAUTT_AGENT_TTS_CONFIG,
} from '@/const/settings';
import { AgentStore } from '@/store/agent';
import { LobeAgentChatConfig, LobeAgentConfig, LobeAgentTTSConfig } from '@/types/agent';
import { merge } from '@/utils/merge';

const isInboxSession = (s: AgentStore) => s.activeId === INBOX_SESSION_ID;

// ==========   Config   ============== //

const defaultAgentConfig = (s: AgentStore) => merge(DEFAULT_AGENT_CONFIG, s.defaultAgentConfig);

const currentAgentConfig = (s: AgentStore): LobeAgentConfig =>
  merge(s.defaultAgentConfig, s.agentConfig);

const currentAgentChatConfig = (s: AgentStore): LobeAgentChatConfig =>
  currentAgentConfig(s).chatConfig || DEFAULT_AGENT_CHAT_CONFIG;

const currentAgentSystemRole = (s: AgentStore) => {
  return currentAgentConfig(s).systemRole;
};

const currentAgentModel = (s: AgentStore): string => {
  const config = currentAgentConfig(s);

  return config?.model || 'gpt-3.5-turbo';
};

const currentAgentModelProvider = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return config?.provider || 'openai';
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

const hasSystemRole = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return !!config.systemRole;
};

export const agentSelectors = {
  currentAgentChatConfig,
  currentAgentConfig,
  currentAgentModel,
  currentAgentModelProvider,
  currentAgentPlugins,
  currentAgentSystemRole,
  currentAgentTTS,
  currentAgentTTSVoice,
  defaultAgentConfig,
  hasSystemRole,
  isInboxSession,
};
