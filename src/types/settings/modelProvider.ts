export type CustomModels = { displayName: string; id: string }[];

export interface OpenAIConfig {
  OPENAI_API_KEY: string;
  azureApiVersion?: string;
  /**
   * custom mode name for fine-tuning or openai like model
   */
  customModelName?: string;
  enabled: boolean;
  endpoint?: string;
  /**
   * @deprecated
   */
  models?: string[];
  useAzure?: boolean;
}

export interface AzureOpenAIConfig {
  apiKey: string;
  apiVersion?: string;
  deployments: string;
  enabled: boolean;
  endpoint?: string;
}

export interface ZhiPuConfig {
  apiKey?: string;
  enabled: boolean;
  endpoint?: string;
}

export interface MoonshotConfig {
  apiKey?: string;
  enabled: boolean;
}

export interface GoogleConfig {
  apiKey?: string;
  enabled: boolean;
  endpoint?: string;
}

export interface AWSBedrockConfig {
  accessKeyId?: string;
  enabled: boolean;
  region?: string;
  secretAccessKey?: string;
}

export interface OllamaConfig {
  customModelName?: string;
  enabled?: boolean;
  endpoint?: string;
}

export interface PerplexityConfig {
  apiKey?: string;
  enabled: boolean;
  endpoint?: string;
}

export interface AnthropicConfig {
  apiKey?: string;
  enabled: boolean;
  endpoint?: string;
}

export interface MistralConfig {
  apiKey?: string;
  enabled: boolean;
}

export interface GroqConfig {
  apiKey?: string;
  enabled: boolean;
}

export interface OpenRouterConfig {
  apiKey?: string;
  customModelName?: string;
  enabled?: boolean;
}

export interface ZeroOneConfig {
  apiKey?: string;
  customModelName?: string;
  enabled?: boolean;
}

export interface GlobalLLMConfig {
  anthropic: AnthropicConfig;
  azure: AzureOpenAIConfig;
  bedrock: AWSBedrockConfig;
  google: GoogleConfig;
  groq: GroqConfig;
  mistral: MistralConfig;
  moonshot: MoonshotConfig;
  ollama: OllamaConfig;
  openAI: OpenAIConfig;
  openrouter: OpenRouterConfig;
  perplexity: PerplexityConfig;
  zeroone: ZeroOneConfig;
  zhipu: ZhiPuConfig;
}

export type GlobalLLMProviderKey = keyof GlobalLLMConfig;
