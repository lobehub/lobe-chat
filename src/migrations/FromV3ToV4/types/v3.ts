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
  bedrock: any;
  google: V3GeneralConfig;
  ollama: V3LegacyConfig;
  openAI: V3OpenAIConfig;
  openrouter: V3LegacyConfig;
  togetherai: V3LegacyConfig;
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
