import { DEFAULT_MODEL } from '@/const/settings/llm';
import { LobeAgentChatConfig, LobeAgentConfig, ModelProvider } from '@/types/agent';

export const DEFAULT_AGENT_CHAT_CONFIG: LobeAgentChatConfig = {
  autoCreateTopicThreshold: 2,
  displayMode: 'chat',
  enableAutoCreateTopic: true,
  enableCompressHistory: true,
  enableHistoryCount: true,
  historyCount: 8,
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
  provider: ModelProvider.OpenAI,
  systemRole: '',
};
