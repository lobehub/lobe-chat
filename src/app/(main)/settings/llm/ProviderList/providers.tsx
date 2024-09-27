import { useMemo } from 'react';

import {
  Ai21ProviderCard,
  Ai360ProviderCard,
  AnthropicProviderCard,
  BaichuanProviderCard,
  DeepSeekProviderCard,
  FireworksAIProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  HunyuanProviderCard,
  MinimaxProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  NovitaProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  QwenProviderCard,
  SiliconCloudProviderCard,
  SparkProviderCard,
  StepfunProviderCard,
  TaichuProviderCard,
  TogetherAIProviderCard,
  UpstageProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
} from '@/config/modelProviders';

import { ProviderItem } from '../type';
import { useAzureProvider } from './Azure';
import { useBedrockProvider } from './Bedrock';
import { useGithubProvider } from './Github';
import { useOllamaProvider } from './Ollama';
import { useOpenAIProvider } from './OpenAI';

export const useProviderList = (): ProviderItem[] => {
  const AzureProvider = useAzureProvider();
  const OllamaProvider = useOllamaProvider();
  const OpenAIProvider = useOpenAIProvider();
  const BedrockProvider = useBedrockProvider();
  const GithubProvider = useGithubProvider();

  return useMemo(
    () => [
      OpenAIProvider,
      AzureProvider,
      OllamaProvider,
      AnthropicProviderCard,
      BedrockProvider,
      GoogleProviderCard,
      DeepSeekProviderCard,
      OpenRouterProviderCard,
      GithubProvider,
      NovitaProviderCard,
      TogetherAIProviderCard,
      FireworksAIProviderCard,
      GroqProviderCard,
      PerplexityProviderCard,
      MistralProviderCard,
      Ai21ProviderCard,
      UpstageProviderCard,
      QwenProviderCard,
      HunyuanProviderCard,
      SparkProviderCard,
      ZhiPuProviderCard,
      ZeroOneProviderCard,
      StepfunProviderCard,
      MoonshotProviderCard,
      BaichuanProviderCard,
      MinimaxProviderCard,
      Ai360ProviderCard,
      TaichuProviderCard,
      SiliconCloudProviderCard,
    ],
    [AzureProvider, OllamaProvider, OpenAIProvider, BedrockProvider, GithubProvider],
  );
};
