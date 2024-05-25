import { ChatModelCard } from '@/types/llm';

export interface OpenAICompatibleProviderConfig {
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

export interface AzureOpenAIConfig extends Omit<OpenAICompatibleProviderConfig, 'endpoint'> {
  apiVersion?: string;
  endpoint?: string;
}

export interface AWSBedrockConfig
  extends Omit<OpenAICompatibleProviderConfig, 'apiKey' | 'endpoint'> {
  accessKeyId?: string;
  region?: string;
  secretAccessKey?: string;
}

export interface UserModelProviderConfig {
  anthropic: OpenAICompatibleProviderConfig;
  azure: AzureOpenAIConfig;
  bedrock: AWSBedrockConfig;
  deepseek: OpenAICompatibleProviderConfig;
  google: OpenAICompatibleProviderConfig;
  groq: OpenAICompatibleProviderConfig;
  minimax: OpenAICompatibleProviderConfig;
  mistral: OpenAICompatibleProviderConfig;
  moonshot: OpenAICompatibleProviderConfig;
  ollama: OpenAICompatibleProviderConfig;
  openai: OpenAICompatibleProviderConfig;
  openrouter: OpenAICompatibleProviderConfig;
  perplexity: OpenAICompatibleProviderConfig;
  togetherai: OpenAICompatibleProviderConfig;
  zeroone: OpenAICompatibleProviderConfig;
  zhipu: OpenAICompatibleProviderConfig;
}

export type GlobalLLMProviderKey = keyof UserModelProviderConfig;
