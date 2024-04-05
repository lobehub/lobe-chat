import { DEFAULT_AGENT_META } from '@/const/meta';
import { ModelProvider } from '@/libs/agent-runtime';
import { LobeAgentConfig, LobeAgentTTSConfig } from '@/types/agent';
import { GlobalDefaultAgent } from '@/types/settings';

export const DEFAUTT_AGENT_TTS_CONFIG: LobeAgentTTSConfig = {
  showAllLocaleVoice: false,
  sttLocale: 'auto',
  ttsService: 'openai',
  voice: {
    openai: 'alloy',
  },
};

export const DEFAULT_AGENT_CONFIG: LobeAgentConfig = {
  autoCreateTopicThreshold: 2,
  displayMode: 'chat',
  enableAutoCreateTopic: true,
  historyCount: 1,
  model: 'gpt-3.5-turbo',
  params: {
    frequency_penalty: 0,
    presence_penalty: 0,
    temperature: 0.6,
    top_p: 1,
  },
  plugins: [],
  provider: ModelProvider.OpenAI,
  systemRole: '',
  tts: DEFAUTT_AGENT_TTS_CONFIG,
};

export const DEFAULT_AGENT: GlobalDefaultAgent = {
  config: DEFAULT_AGENT_CONFIG,
  meta: DEFAULT_AGENT_META,
};
