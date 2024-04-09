import { ChatModelCard } from '@/types/llm';

export type CustomModels = { displayName: string; id: string }[];

export interface GeneralModelProviderConfig {
  apiKey?: string;
  customModelCards?: ChatModelCard[];
  enabled: boolean;
  /**
   * enabled models id
   */
  enabledModels?: string[] | null;
  endpoint?: string;

  /**
   * the model cards defined in server
   */
  serverModelCards?: ChatModelCard[];
}

export interface AzureOpenAIConfig extends GeneralModelProviderConfig {
  apiVersion?: string;
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
  google: GeneralModelProviderConfig;
  groq: GeneralModelProviderConfig;
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
