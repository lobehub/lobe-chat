/**
 * 移动端 Agent 默认配置
 * 与 web 端保持完全一致
 */

import {
  LobeAgentConfig,
  LobeAgentChatConfig,
  LobeAgentTTSConfig,
  WorkingModel,
} from '@/types/agent';

/**
 * 默认模型和提供商
 */
export const DEFAULT_MODEL = 'gpt-4o-mini';
export const DEFAULT_PROVIDER = 'openai';

/**
 * 默认搜索功能模型
 */
export const DEFAULT_AGENT_SEARCH_FC_MODEL: WorkingModel = {
  model: DEFAULT_MODEL,
  provider: DEFAULT_PROVIDER,
};

/**
 * 默认 TTS 配置
 */
export const DEFAUTT_AGENT_TTS_CONFIG: LobeAgentTTSConfig = {
  showAllLocaleVoice: false,
  sttLocale: 'auto',
  ttsService: 'openai',
  voice: {
    openai: 'alloy',
  },
};

/**
 * 默认聊天配置
 */
export const DEFAULT_AGENT_CHAT_CONFIG: LobeAgentChatConfig = {
  autoCreateTopicThreshold: 2,
  displayMode: 'chat',
  enableAutoCreateTopic: true,
  enableCompressHistory: true,
  enableHistoryCount: true,
  enableReasoning: false,
  historyCount: 20,
  reasoningBudgetToken: 1024,
  searchFCModel: DEFAULT_AGENT_SEARCH_FC_MODEL,
  searchMode: 'off',
};

/**
 * 默认 Agent 配置
 */
export const DEFAULT_AGENT_CONFIG: LobeAgentConfig = {
  chatConfig: DEFAULT_AGENT_CHAT_CONFIG,
  model: DEFAULT_MODEL,
  openingQuestions: [],
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
