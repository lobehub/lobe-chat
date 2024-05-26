interface V6OpenAICompatibleConfig {
  apiKey?: string;
  autoFetchModelLists?: boolean;
  customModelCards?: any[];
  enabled: boolean;
  enabledModels?: string[] | null;
  endpoint?: string;
  fetchOnClient?: boolean;
  latestFetchTime?: number;
  remoteModelCards?: any[];
}

interface AzureOpenAIConfig extends Omit<V6OpenAICompatibleConfig, 'endpoint'> {
  apiVersion?: string;
  endpoint?: string;
}

interface AWSBedrockConfig extends Omit<V6OpenAICompatibleConfig, 'apiKey' | 'endpoint'> {
  accessKeyId?: string;
  region?: string;
  secretAccessKey?: string;
}

interface V6ModelProviderConfig {
  anthropic: V6OpenAICompatibleConfig;
  azure: AzureOpenAIConfig;
  bedrock: AWSBedrockConfig;
  deepseek: V6OpenAICompatibleConfig;
  google: V6OpenAICompatibleConfig;
  groq: V6OpenAICompatibleConfig;
  minimax: V6OpenAICompatibleConfig;
  mistral: V6OpenAICompatibleConfig;
  moonshot: V6OpenAICompatibleConfig;
  ollama: V6OpenAICompatibleConfig;
  openai: V6OpenAICompatibleConfig;
  openrouter: V6OpenAICompatibleConfig;
  perplexity: V6OpenAICompatibleConfig;
  togetherai: V6OpenAICompatibleConfig;
  zeroone: V6OpenAICompatibleConfig;
  zhipu: V6OpenAICompatibleConfig;
}

export type V6ProviderKey = keyof V6ModelProviderConfig;

export interface V6Settings {
  defaultAgent: any;
  fontSize: number;
  language: string;
  languageModel?: V6ModelProviderConfig;
  neutralColor?: string;
  password: string;
  primaryColor?: string;
  sync: any;
  themeMode: string;
  tool: any;
  tts: any;
}

export interface V6ConfigState {
  settings?: V6Settings;
}
