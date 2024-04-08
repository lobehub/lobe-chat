import { ChatModelCard } from '@/types/llm';

export type CustomModels = { displayName: string; id: string }[];

export interface GeneralModelProviderConfig {
  apiKey?: string;
  customModelCards?: ChatModelCard[];
  enabled: boolean;
  /**
   * enabled models id
   */
  enabledModels: string[] | null;
  endpoint?: string;
}

export interface OpenAIConfig {
  OPENAI_API_KEY: string;
  azureApiVersion?: string;
  /**
   * custom mode name for fine-tuning or openai like model
   */
  customModelName?: string;
  enabled: boolean;
  enabledModels?: string[];
  endpoint?: string;
  useAzure?: boolean;
}

export interface AzureOpenAIConfig {
  apiKey: string;
  apiVersion?: string;
  deployments: string;
  enabled: boolean;
  endpoint?: string;
}

export interface AWSBedrockConfig {
  accessKeyId?: string;
  enabled: boolean;
  models: string[];
  region?: string;
  secretAccessKey?: string;
}

export interface OllamaConfig {
  customModelName?: string;
  enabled?: boolean;
  enabledModels: string[];
  endpoint?: string;
}

export interface OpenRouterConfig {
  apiKey?: string;
  customModelName?: string;
  enabled?: boolean;
  enabledModels: string[];
}

export interface TogetherAIConfig {
  apiKey?: string;
  customModelName?: string;
  enabled?: boolean;
  models: string[];
}

export interface GlobalLLMConfig {
  anthropic: GeneralModelProviderConfig;
  azure: AzureOpenAIConfig;
  bedrock: AWSBedrockConfig;
  google: GeneralModelProviderConfig;
  groq: GeneralModelProviderConfig;
  mistral: GeneralModelProviderConfig;
  moonshot: GeneralModelProviderConfig;
  ollama: OllamaConfig;
  openAI: OpenAIConfig;
  openrouter: OpenRouterConfig;
  perplexity: GeneralModelProviderConfig;
  togetherai: TogetherAIConfig;
  zeroone: GeneralModelProviderConfig;
  zhipu: GeneralModelProviderConfig;
}

export type GlobalLLMProviderKey = keyof GlobalLLMConfig;
