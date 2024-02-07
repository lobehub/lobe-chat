import { DEFAULT_AGENT_META } from '@/const/meta';
import { ModelProvider } from '@/libs/agent-runtime';
import { LobeAgentConfig, LobeAgentTTSConfig } from '@/types/agent';
import {
  GlobalBaseSettings,
  GlobalDefaultAgent,
  GlobalLLMConfig,
  GlobalSettings,
  GlobalTTSConfig,
} from '@/types/settings';

export const DEFAULT_BASE_SETTINGS: GlobalBaseSettings = {
  fontSize: 14,
  language: 'auto',
  password: '',
  themeMode: 'auto',
};

export const DEFAUTT_AGENT_TTS_CONFIG: LobeAgentTTSConfig = {
  showAllLocaleVoice: false,
  sttLocale: 'auto',
  ttsService: 'openai',
  voice: {
    openai: 'alloy',
  },
};

export const COOKIE_CACHE_DAYS = 30;

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

export const DEFAULT_LLM_CONFIG: GlobalLLMConfig = {
  azure: {
    apiKey: '',
    deployments: '',
    enabled: false,
    endpoint: '',
  },
  bedrock: {
    accessKeyId: '',
    enabled: false,
    region: 'us-east-1',
    secretAccessKey: '',
  },
  google: {
    apiKey: '',
    enabled: false,
  },
  moonshot: {
    apiKey: '',
    enabled: false,
  },
  openAI: {
    OPENAI_API_KEY: '',
    models: [],
  },
  zhipu: {
    apiKey: '',
    enabled: false,
  },
};

export const DEFAULT_AGENT: GlobalDefaultAgent = {
  config: DEFAULT_AGENT_CONFIG,
  meta: DEFAULT_AGENT_META,
};

export const DEFAULT_TTS_CONFIG: GlobalTTSConfig = {
  openAI: {
    sttModel: 'whisper-1',
    ttsModel: 'tts-1',
  },
  sttAutoStop: true,
  sttServer: 'openai',
};

export const DEFAULT_TOOL_CONFIG = {
  dalle: {
    autoGenerate: false,
  },
};

export const DEFAULT_SETTINGS: GlobalSettings = {
  defaultAgent: DEFAULT_AGENT,
  languageModel: DEFAULT_LLM_CONFIG,
  tool: DEFAULT_TOOL_CONFIG,
  tts: DEFAULT_TTS_CONFIG,
  ...DEFAULT_BASE_SETTINGS,
};
