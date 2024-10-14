import {
  Ai21ProviderCard,
  Ai360ProviderCard,
  AnthropicProviderCard,
  BaichuanProviderCard,
  BedrockProviderCard,
  DeepSeekProviderCard,
  FireworksAIProviderCard,
  GithubProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  HuggingFaceProviderCard,
  HunyuanProviderCard,
  MinimaxProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  NovitaProviderCard,
  OllamaProviderCard,
  OpenAIProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  QwenProviderCard,
  SiliconCloudProviderCard,
  SparkProviderCard,
  StepfunProviderCard,
  TaichuProviderCard,
  TogetherAIProviderCard,
  UpstageProviderCard,
  WenxinProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
  filterEnabledModels,
} from '@/config/modelProviders';
import { ModelProvider } from '@/libs/agent-runtime';
import { UserModelProviderConfig } from '@/types/user/settings';

export const DEFAULT_LLM_CONFIG: UserModelProviderConfig = {
  ai21: {
    enabled: false,
    enabledModels: filterEnabledModels(Ai21ProviderCard),
  },
  ai360: {
    enabled: false,
    enabledModels: filterEnabledModels(Ai360ProviderCard),
  },
  anthropic: {
    enabled: false,
    enabledModels: filterEnabledModels(AnthropicProviderCard),
  },
  azure: {
    enabled: false,
  },
  baichuan: {
    enabled: false,
    enabledModels: filterEnabledModels(BaichuanProviderCard),
  },
  bedrock: {
    enabled: false,
    enabledModels: filterEnabledModels(BedrockProviderCard),
  },
  deepseek: {
    enabled: false,
    enabledModels: filterEnabledModels(DeepSeekProviderCard),
  },
  fireworksai: {
    enabled: false,
    enabledModels: filterEnabledModels(FireworksAIProviderCard),
  },
  github: {
    enabled: false,
    enabledModels: filterEnabledModels(GithubProviderCard),
  },
  google: {
    enabled: false,
    enabledModels: filterEnabledModels(GoogleProviderCard),
  },
  groq: {
    enabled: false,
    enabledModels: filterEnabledModels(GroqProviderCard),
  },
  huggingface: {
    enabled: false,
    enabledModels: filterEnabledModels(HuggingFaceProviderCard),
  },
  hunyuan: {
    enabled: false,
    enabledModels: filterEnabledModels(HunyuanProviderCard),
  },
  minimax: {
    enabled: false,
    enabledModels: filterEnabledModels(MinimaxProviderCard),
  },
  mistral: {
    enabled: false,
    enabledModels: filterEnabledModels(MistralProviderCard),
  },
  moonshot: {
    enabled: false,
    enabledModels: filterEnabledModels(MoonshotProviderCard),
  },
  novita: {
    enabled: false,
    enabledModels: filterEnabledModels(NovitaProviderCard),
  },
  ollama: {
    enabled: true,
    enabledModels: filterEnabledModels(OllamaProviderCard),
    fetchOnClient: true,
  },
  openai: {
    enabled: true,
    enabledModels: filterEnabledModels(OpenAIProviderCard),
  },
  openrouter: {
    enabled: false,
    enabledModels: filterEnabledModels(OpenRouterProviderCard),
  },
  perplexity: {
    enabled: false,
    enabledModels: filterEnabledModels(PerplexityProviderCard),
  },
  qwen: {
    enabled: false,
    enabledModels: filterEnabledModels(QwenProviderCard),
  },
  siliconcloud: {
    enabled: false,
    enabledModels: filterEnabledModels(SiliconCloudProviderCard),
  },
  spark: {
    enabled: false,
    enabledModels: filterEnabledModels(SparkProviderCard),
  },
  stepfun: {
    enabled: false,
    enabledModels: filterEnabledModels(StepfunProviderCard),
  },
  taichu: {
    enabled: false,
    enabledModels: filterEnabledModels(TaichuProviderCard),
  },
  togetherai: {
    enabled: false,
    enabledModels: filterEnabledModels(TogetherAIProviderCard),
  },
  upstage: {
    enabled: false,
    enabledModels: filterEnabledModels(UpstageProviderCard),
  },
  wenxin: {
    enabled: false,
    enabledModels: filterEnabledModels(WenxinProviderCard),
  },
  zeroone: {
    enabled: false,
    enabledModels: filterEnabledModels(ZeroOneProviderCard),
  },
  zhipu: {
    enabled: false,
    enabledModels: filterEnabledModels(ZhiPuProviderCard),
  },
};

export const DEFAULT_MODEL = 'gpt-4o-mini';
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-3-small';

export const DEFAULT_PROVIDER = ModelProvider.OpenAI;
