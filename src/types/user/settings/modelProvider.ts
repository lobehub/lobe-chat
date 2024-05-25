import { ChatModelCard } from '@/types/llm';

export interface GeneralModelProviderConfig {
  /**
   * @deprecated
   */
  apiKey?: string;
  /**
   * whether to auto fetch model lists
   */
  autoFetchModelLists?: boolean;
  /**
   * user defined model cards
   */
  customModelCards?: ChatModelCard[];
  enabled: boolean;
  /**
   * enabled models id
   */
  enabledModels?: string[] | null;
  /**
   * @deprecated
   */
  endpoint?: string;
  /**
   * whether fetch on client
   */
  fetchOnClient?: boolean;
  /**
   * the latest fetch model list time
   */
  latestFetchTime?: number;
  /**
   * fetched models from provider side
   */
  remoteModelCards?: ChatModelCard[];
}

export interface AzureOpenAIConfig extends Omit<GeneralModelProviderConfig, 'endpoint'> {
  apiVersion?: string;
  endpoint?: string;
}

export interface AWSBedrockConfig extends Omit<GeneralModelProviderConfig, 'apiKey' | 'endpoint'> {
  accessKeyId?: string;
  region?: string;
  secretAccessKey?: string;
}

export interface GlobalLLMConfig {
  anthropic: GeneralModelProviderConfig;
  azure: AzureOpenAIConfig;
  bedrock: AWSBedrockConfig;
  deepseek: GeneralModelProviderConfig;
  google: GeneralModelProviderConfig;
  groq: GeneralModelProviderConfig;
  minimax: GeneralModelProviderConfig;
  mistral: GeneralModelProviderConfig;
  moonshot: GeneralModelProviderConfig;
  ollama: GeneralModelProviderConfig;
  openai: GeneralModelProviderConfig;
  openrouter: GeneralModelProviderConfig;
  perplexity: GeneralModelProviderConfig;
  togetherai: GeneralModelProviderConfig;
  zeroone: GeneralModelProviderConfig;
  zhipu: GeneralModelProviderConfig;
}

export type GlobalLLMProviderKey = keyof GlobalLLMConfig;
