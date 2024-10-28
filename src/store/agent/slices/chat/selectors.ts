import { VoiceList } from '@lobehub/tts';

import { INBOX_SESSION_ID } from '@/const/session';
import {
  DEFAULT_AGENT_CONFIG,
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  DEFAUTT_AGENT_TTS_CONFIG,
} from '@/const/settings';
import { AgentStore } from '@/store/agent';
import { LobeAgentChatConfig, LobeAgentConfig, LobeAgentTTSConfig } from '@/types/agent';
import { KnowledgeItem, KnowledgeType } from '@/types/knowledgeBase';
import { merge } from '@/utils/merge';

const isInboxSession = (s: AgentStore) => s.activeId === INBOX_SESSION_ID;

// ==========   Config   ============== //

const inboxAgentConfig = (s: AgentStore) =>
  merge(DEFAULT_AGENT_CONFIG, s.agentMap[INBOX_SESSION_ID]);
const inboxAgentModel = (s: AgentStore) => inboxAgentConfig(s).model;

const getAgentConfigById =
  (id: string) =>
  (s: AgentStore): LobeAgentConfig =>
    merge(s.defaultAgentConfig, s.agentMap[id]);

const currentAgentConfig = (s: AgentStore): LobeAgentConfig => getAgentConfigById(s.activeId)(s);

const currentAgentChatConfig = (s: AgentStore): LobeAgentChatConfig =>
  currentAgentConfig(s).chatConfig || {};

const currentAgentSystemRole = (s: AgentStore) => {
  return currentAgentConfig(s).systemRole;
};

const currentAgentModel = (s: AgentStore): string => {
  const config = currentAgentConfig(s);

  return config?.model || DEFAULT_MODEL;
};

const currentAgentModelProvider = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return config?.provider || DEFAULT_PROVIDER;
};

const currentAgentPlugins = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return config?.plugins || [];
};

const currentAgentKnowledgeBases = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return config?.knowledgeBases || [];
};

const currentAgentFiles = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return config?.files || [];
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

const currentEnabledKnowledge = (s: AgentStore) => {
  const knowledgeBases = currentAgentKnowledgeBases(s);
  const files = currentAgentFiles(s);

  return [
    ...files
      .filter((f) => f.enabled)
      .map((f) => ({ fileType: f.type, id: f.id, name: f.name, type: KnowledgeType.File })),
    ...knowledgeBases
      .filter((k) => k.enabled)
      .map((k) => ({ id: k.id, name: k.name, type: KnowledgeType.KnowledgeBase })),
  ] as KnowledgeItem[];
};

const hasSystemRole = (s: AgentStore) => {
  const config = currentAgentConfig(s);

  return !!config.systemRole;
};

const hasKnowledgeBases = (s: AgentStore) => {
  const knowledgeBases = currentAgentKnowledgeBases(s);

  return knowledgeBases.length > 0;
};

const hasFiles = (s: AgentStore) => {
  const files = currentAgentFiles(s);

  return files.length > 0;
};

const hasKnowledge = (s: AgentStore) => hasKnowledgeBases(s) || hasFiles(s);
const hasEnabledKnowledge = (s: AgentStore) => currentEnabledKnowledge(s).length > 0;
const currentKnowledgeIds = (s: AgentStore) => {
  return {
    fileIds: currentAgentFiles(s)
      .filter((item) => item.enabled)
      .map((f) => f.id),
    knowledgeBaseIds: currentAgentKnowledgeBases(s)
      .filter((item) => item.enabled)
      .map((k) => k.id),
  };
};

export const agentSelectors = {
  currentAgentChatConfig,
  currentAgentConfig,
  currentAgentFiles,
  currentAgentKnowledgeBases,
  currentAgentModel,
  currentAgentModelProvider,
  currentAgentPlugins,
  currentAgentSystemRole,
  currentAgentTTS,
  currentAgentTTSVoice,
  currentEnabledKnowledge,
  currentKnowledgeIds,
  getAgentConfigById,
  hasEnabledKnowledge,
  hasKnowledge,
  hasSystemRole,
  inboxAgentConfig,
  inboxAgentModel,
  isInboxSession,
};
