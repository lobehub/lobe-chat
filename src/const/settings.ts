import { getClientConfig } from '@/config/client';
import { DEFAULT_OPENAI_MODEL_LIST } from '@/const/llm';
import { DEFAULT_AGENT_META } from '@/const/meta';
import { LobeAgentConfig, LobeAgentTTSConfig } from '@/types/agent';
import { LanguageModel } from '@/types/llm';
import {
  GlobalBaseSettings,
  GlobalDefaultAgent,
  GlobalLLMConfig,
  GlobalSettings,
  GlobalTTSConfig,
} from '@/types/settings';

export const DEFAULT_BASE_SETTINGS: GlobalBaseSettings = {
  avatar: '',
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

export const VISION_MODEL_DEFAULT_MAX_TOKENS = 1000;

export const COOKIE_CACHE_DAYS = 30;

export const DEFAULT_AGENT_CONFIG: LobeAgentConfig = {
  autoCreateTopicThreshold: 2,
  displayMode: 'chat',
  enableAutoCreateTopic: true,
  historyCount: 1,
  model: LanguageModel.GPT3_5,
  params: {
    frequency_penalty: 0,
    presence_penalty: 0,
    temperature: 0.6,
    top_p: 1,
  },
  plugins: [],
  systemRole: '',
  tts: DEFAUTT_AGENT_TTS_CONFIG,
};

export const DEFAULT_LLM_CONFIG: GlobalLLMConfig = {
  openAI: {
    OPENAI_API_KEY: '',
    // support user custom model names with env var
    customModelName: getClientConfig().CUSTOM_MODELS,
    models: DEFAULT_OPENAI_MODEL_LIST,
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

export const DEFAULT_SETTINGS: GlobalSettings = {
  defaultAgent: DEFAULT_AGENT,
  languageModel: DEFAULT_LLM_CONFIG,
  tts: DEFAULT_TTS_CONFIG,
  ...DEFAULT_BASE_SETTINGS,
};
