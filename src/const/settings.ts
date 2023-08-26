import { DEFAULT_AGENT_META } from '@/const/meta';
import { LanguageModel } from '@/types/llm';
import { LobeAgentConfig } from '@/types/session';
import { GlobalBaseSettings, GlobalDefaultAgent, GlobalSettings } from '@/types/settings';

export const DEFAULT_BASE_SETTINGS: GlobalBaseSettings = {
  OPENAI_API_KEY: '',
  avatar: '',
  compressThreshold: 24,
  enableCompressThreshold: false,
  enableHistoryCount: false,
  enableMaxTokens: true,
  endpoint: '',
  fontSize: 14,
  historyCount: 24,
  language: 'zh-CN',
  neutralColor: '',
  password: '',
  primaryColor: '',
  themeMode: 'auto',
};

export const DEFAULT_AGENT_CONFIG: LobeAgentConfig = {
  displayMode: 'chat',
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
};

export const DEFAULT_AGENT: GlobalDefaultAgent = {
  config: DEFAULT_AGENT_CONFIG,
  meta: DEFAULT_AGENT_META,
};

export const DEFAULT_SETTINGS: GlobalSettings = {
  defaultAgent: DEFAULT_AGENT,
  ...DEFAULT_BASE_SETTINGS,
};
