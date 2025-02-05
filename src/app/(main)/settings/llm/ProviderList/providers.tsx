import { useMemo } from 'react';

import {
  Ai21ProviderCard,
  Ai360ProviderCard,
  AnthropicProviderCard,
  BaichuanProviderCard,
  DeepSeekProviderCard,
  FireworksAIProviderCard,
  GiteeAIProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  HigressProviderCard,
  HunyuanProviderCard,
  InternLMProviderCard,
  MinimaxProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  NovitaProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  QwenProviderCard,
  SenseNovaProviderCard,
  SiliconCloudProviderCard,
  SparkProviderCard,
  StepfunProviderCard,
  TaichuProviderCard,
  TogetherAIProviderCard,
  UpstageProviderCard,
  WenxinProviderCard,
  XAIProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
} from '@/config/modelProviders';

import { ProviderItem } from '../type';
import { useAzureProvider } from './Azure';
import { useBedrockProvider } from './Bedrock';
import { useCloudflareProvider } from './Cloudflare';
import { useGithubProvider } from './Github';
import { useHuggingFaceProvider } from './HuggingFace';
import { useOllamaProvider } from './Ollama';
import { useOpenAIProvider } from './OpenAI';

export const useProviderList = (): ProviderItem[] => {
  const AzureProvider = useAzureProvider();
  const OllamaProvider = useOllamaProvider();
  const OpenAIProvider = useOpenAIProvider();
  const BedrockProvider = useBedrockProvider();
  const CloudflareProvider = useCloudflareProvider();
  const GithubProvider = useGithubProvider();
  const HuggingFaceProvider = useHuggingFaceProvider();

  return useMemo(
    () => [
      OpenAIProvider,
      AzureProvider,
      OllamaProvider,
      AnthropicProviderCard,
      BedrockProvider,
      GoogleProviderCard,
      DeepSeekProviderCard,
      HuggingFaceProvider,
      OpenRouterProviderCard,
      CloudflareProvider,
      GithubProvider,
      NovitaProviderCard,
      TogetherAIProviderCard,
      FireworksAIProviderCard,
      GroqProviderCard,
      PerplexityProviderCard,
      MistralProviderCard,
      Ai21ProviderCard,
      UpstageProviderCard,
      XAIProviderCard,
      QwenProviderCard,
      WenxinProviderCard,
      HunyuanProviderCard,
      SparkProviderCard,
      ZhiPuProviderCard,
      ZeroOneProviderCard,
      SenseNovaProviderCard,
      StepfunProviderCard,
      MoonshotProviderCard,
      BaichuanProviderCard,
      MinimaxProviderCard,
      Ai360ProviderCard,
      TaichuProviderCard,
      InternLMProviderCard,
      SiliconCloudProviderCard,
      HigressProviderCard,
      GiteeAIProviderCard,
    ],
    [
      AzureProvider,
      OllamaProvider,
      OpenAIProvider,
      BedrockProvider,
      CloudflareProvider,
      GithubProvider,
      HuggingFaceProvider,
    ],
  );
};
