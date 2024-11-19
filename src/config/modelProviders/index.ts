import { ChatModelCard, ModelProviderCard } from '@/types/llm';

import Ai21Provider from './ai21';
import Ai360Provider from './ai360';
import AnthropicProvider from './anthropic';
import AzureProvider from './azure';
import BaichuanProvider from './baichuan';
import BedrockProvider from './bedrock';
import CloudflareProvider from './cloudflare';
import DeepSeekProvider from './deepseek';
import FireworksAIProvider from './fireworksai';
import GiteeAIProvider from './giteeai';
import GithubProvider from './github';
import GoogleProvider from './google';
import GroqProvider from './groq';
import HuggingFaceProvider from './huggingface';
import HunyuanProvider from './hunyuan';
import InternLMProvider from './internlm';
import MinimaxProvider from './minimax';
import MistralProvider from './mistral';
import MoonshotProvider from './moonshot';
import NovitaProvider from './novita';
import OllamaProvider from './ollama';
import OpenAIProvider from './openai';
import OpenRouterProvider from './openrouter';
import PerplexityProvider from './perplexity';
import QwenProvider from './qwen';
import SenseNovaProvider from './sensenova';
import SiliconCloudProvider from './siliconcloud';
import SparkProvider from './spark';
import StepfunProvider from './stepfun';
import TaichuProvider from './taichu';
import TogetherAIProvider from './togetherai';
import UpstageProvider from './upstage';
import WenxinProvider from './wenxin';
import XAIProvider from './xai';
import ZeroOneProvider from './zeroone';
import ZhiPuProvider from './zhipu';

export const LOBE_DEFAULT_MODEL_LIST: ChatModelCard[] = [
  OpenAIProvider.chatModels,
  QwenProvider.chatModels,
  ZhiPuProvider.chatModels,
  BedrockProvider.chatModels,
  DeepSeekProvider.chatModels,
  GoogleProvider.chatModels,
  GroqProvider.chatModels,
  GithubProvider.chatModels,
  MinimaxProvider.chatModels,
  MistralProvider.chatModels,
  MoonshotProvider.chatModels,
  OllamaProvider.chatModels,
  OpenRouterProvider.chatModels,
  TogetherAIProvider.chatModels,
  FireworksAIProvider.chatModels,
  PerplexityProvider.chatModels,
  AnthropicProvider.chatModels,
  HuggingFaceProvider.chatModels,
  XAIProvider.chatModels,
  ZeroOneProvider.chatModels,
  StepfunProvider.chatModels,
  NovitaProvider.chatModels,
  BaichuanProvider.chatModels,
  TaichuProvider.chatModels,
  CloudflareProvider.chatModels,
  Ai360Provider.chatModels,
  SiliconCloudProvider.chatModels,
  GiteeAIProvider.chatModels,
  UpstageProvider.chatModels,
  SparkProvider.chatModels,
  Ai21Provider.chatModels,
  HunyuanProvider.chatModels,
  WenxinProvider.chatModels,
  SenseNovaProvider.chatModels,
  InternLMProvider.chatModels,
].flat();

export const DEFAULT_MODEL_PROVIDER_LIST = [
  OpenAIProvider,
  { ...AzureProvider, chatModels: [] },
  OllamaProvider,
  AnthropicProvider,
  BedrockProvider,
  GoogleProvider,
  DeepSeekProvider,
  HuggingFaceProvider,
  OpenRouterProvider,
  CloudflareProvider,
  GithubProvider,
  NovitaProvider,
  TogetherAIProvider,
  FireworksAIProvider,
  GroqProvider,
  PerplexityProvider,
  MistralProvider,
  Ai21Provider,
  UpstageProvider,
  XAIProvider,
  QwenProvider,
  WenxinProvider,
  HunyuanProvider,
  SparkProvider,
  ZhiPuProvider,
  ZeroOneProvider,
  SenseNovaProvider,
  StepfunProvider,
  MoonshotProvider,
  BaichuanProvider,
  MinimaxProvider,
  Ai360Provider,
  TaichuProvider,
  InternLMProvider,
  SiliconCloudProvider,
  GiteeAIProvider,
];

export const filterEnabledModels = (provider: ModelProviderCard) => {
  return provider.chatModels.filter((v) => v.enabled).map((m) => m.id);
};

export const isProviderDisableBroswerRequest = (id: string) => {
  const provider = DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === id && v.disableBrowserRequest);
  return !!provider;
};

export { default as Ai21ProviderCard } from './ai21';
export { default as Ai360ProviderCard } from './ai360';
export { default as AnthropicProviderCard } from './anthropic';
export { default as AzureProviderCard } from './azure';
export { default as BaichuanProviderCard } from './baichuan';
export { default as BedrockProviderCard } from './bedrock';
export { default as CloudflareProviderCard } from './cloudflare';
export { default as DeepSeekProviderCard } from './deepseek';
export { default as FireworksAIProviderCard } from './fireworksai';
export { default as GiteeAIProviderCard } from './giteeai';
export { default as GithubProviderCard } from './github';
export { default as GoogleProviderCard } from './google';
export { default as GroqProviderCard } from './groq';
export { default as HuggingFaceProviderCard } from './huggingface';
export { default as HunyuanProviderCard } from './hunyuan';
export { default as InternLMProviderCard } from './internlm';
export { default as MinimaxProviderCard } from './minimax';
export { default as MistralProviderCard } from './mistral';
export { default as MoonshotProviderCard } from './moonshot';
export { default as NovitaProviderCard } from './novita';
export { default as OllamaProviderCard } from './ollama';
export { default as OpenAIProviderCard } from './openai';
export { default as OpenRouterProviderCard } from './openrouter';
export { default as PerplexityProviderCard } from './perplexity';
export { default as QwenProviderCard } from './qwen';
export { default as SenseNovaProviderCard } from './sensenova';
export { default as SiliconCloudProviderCard } from './siliconcloud';
export { default as SparkProviderCard } from './spark';
export { default as StepfunProviderCard } from './stepfun';
export { default as TaichuProviderCard } from './taichu';
export { default as TogetherAIProviderCard } from './togetherai';
export { default as UpstageProviderCard } from './upstage';
export { default as WenxinProviderCard } from './wenxin';
export { default as XAIProviderCard } from './xai';
export { default as ZeroOneProviderCard } from './zeroone';
export { default as ZhiPuProviderCard } from './zhipu';
