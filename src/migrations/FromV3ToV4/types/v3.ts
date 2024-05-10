interface V3GeneralConfig {
  apiKey?: string;
  enabled: boolean;
  endpoint?: string;
}

export interface V3OpenAIConfig {
  OPENAI_API_KEY: string;
  azureApiVersion?: string;
  customModelName?: string;
  enabled: boolean;
  endpoint?: string;
  useAzure?: boolean;
}

export interface V3LegacyConfig {
  apiKey?: string;
  customModelName?: string;
  enabled?: boolean;
  enabledModels: string[];
  endpoint?: string;
}

export interface V3LLMConfig {
  anthropic: V3GeneralConfig;
  bedrock: any;
  google: V3GeneralConfig;
  groq: V3GeneralConfig;
  minimax: V3GeneralConfig;
  mistral: V3GeneralConfig;
  moonshot: V3GeneralConfig;
  ollama: V3LegacyConfig;
  openAI: V3OpenAIConfig;
  openrouter: V3LegacyConfig;
  perplexity: V3GeneralConfig;
  togetherai: V3LegacyConfig;
  zeroone: V3GeneralConfig;
  zhipu: V3GeneralConfig;
}

/**
 * 配置设置
 */
export interface V3Settings {
  defaultAgent: any;
  fontSize: number;
  language: string;
  languageModel?: Partial<V3LLMConfig>;
  neutralColor?: string;
  password: string;
  primaryColor?: string;
  sync: any;
  themeMode: string;
  tool: any;
  tts: any;
}

export interface V3ConfigState {
  settings?: V3Settings;
}
