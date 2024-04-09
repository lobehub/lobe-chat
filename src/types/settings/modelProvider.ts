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
}

export interface AzureOpenAIConfig {
  apiKey: string;
  apiVersion?: string;
  deployments: string;
  enabled: boolean;
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
