import {
  AnthropicProviderCard,
  BedrockProviderCard,
  DeepSeekProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  MinimaxProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  OllamaProviderCard,
  OpenAIProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  TogetherAIProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
  filterEnabledModels,
} from '@/config/modelProviders';
import { ModelProvider } from '@/libs/agent-runtime';
import { GlobalLLMConfig } from '@/types/settings';

export const DEFAULT_LLM_CONFIG: GlobalLLMConfig = {
  anthropic: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(AnthropicProviderCard),
  },
  azure: {
    apiKey: '',
    enabled: false,
    endpoint: '',
  },
  bedrock: {
    accessKeyId: '',
    enabled: false,
    enabledModels: filterEnabledModels(BedrockProviderCard),
    region: 'us-east-1',
    secretAccessKey: '',
  },
  deepseek: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(DeepSeekProviderCard),
  },
  google: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(GoogleProviderCard),
  },
  groq: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(GroqProviderCard),
  },
  minimax: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(MinimaxProviderCard),
  },
  mistral: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(MistralProviderCard),
  },
  moonshot: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(MoonshotProviderCard),
  },
  ollama: {
    enabled: true,
    enabledModels: filterEnabledModels(OllamaProviderCard),
    endpoint: '',
    fetchOnClient: true,
  },
  openai: {
    apiKey: '',
    enabled: true,
    enabledModels: filterEnabledModels(OpenAIProviderCard),
  },
  openrouter: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(OpenRouterProviderCard),
  },
  perplexity: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(PerplexityProviderCard),
  },
  togetherai: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(TogetherAIProviderCard),
  },
  zeroone: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(ZeroOneProviderCard),
  },
  zhipu: {
    apiKey: '',
    enabled: false,
    enabledModels: filterEnabledModels(ZhiPuProviderCard),
  },
};

export const DEFAULT_MODEL = 'gpt-3.5-turbo';

export const DEFAULT_PROVIDER = ModelProvider.OpenAI;
