import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_MODEL, DEFAULT_PROVIDER } from '@/const/settings/llm';
import { LobeAgentChatConfig, LobeAgentConfig, LobeAgentTTSConfig } from '@/types/agent';
import { UserDefaultAgent } from '@/types/user/settings';

export const DEFAUTT_AGENT_TTS_CONFIG: LobeAgentTTSConfig = {
  showAllLocaleVoice: false,
  sttLocale: 'auto',
  ttsService: 'openai',
  voice: {
    openai: 'alloy',
  },
};

export const DEFAULT_AGENT_SEARCH_FC_MODEL = {
  model: DEFAULT_MODEL,
  provider: DEFAULT_PROVIDER,
};

export const DEFAULT_AGENT_CHAT_CONFIG: LobeAgentChatConfig = {
  autoCreateTopicThreshold: 2,
  displayMode: 'chat',
  enableAutoCreateTopic: true,
  enableCompressHistory: true,
  enableHistoryCount: true,
  enableReasoning: false,
  historyCount: 8,
  reasoningBudgetToken: 1024,
  searchFCModel: DEFAULT_AGENT_SEARCH_FC_MODEL,
  searchMode: 'off',
};

export const DEFAULT_AGENT_CONFIG: LobeAgentConfig = {
  chatConfig: DEFAULT_AGENT_CHAT_CONFIG,
  model: DEFAULT_MODEL,
  params: {
    frequency_penalty: 0,
    presence_penalty: 0,
    temperature: 1,
    top_p: 1,
  },
  plugins: [],
  provider: DEFAULT_PROVIDER,
  systemRole: '',
  tts: DEFAUTT_AGENT_TTS_CONFIG,
};

export const DEFAULT_AGENT: UserDefaultAgent = {
  config: DEFAULT_AGENT_CONFIG,
  meta: DEFAULT_AGENT_META,
};
