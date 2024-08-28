import { useMemo } from 'react';

import {
  Ai360ProviderCard,
  AnthropicProviderCard,
  BaichuanProviderCard,
  DeepSeekProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  MinimaxProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  NovitaProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  QwenProviderCard,
  SiliconCloudProviderCard,
  StepfunProviderCard,
  TaichuProviderCard,
  TogetherAIProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
} from '@/config/modelProviders';

import { ProviderItem } from '../type';
import { useAzureProvider } from './Azure';
import { useBedrockProvider } from './Bedrock';
import { useOllamaProvider } from './Ollama';
import { useOpenAIProvider } from './OpenAI';

export const useProviderList = (): ProviderItem[] => {
  const AzureProvider = useAzureProvider();
  const OllamaProvider = useOllamaProvider();
  const OpenAIProvider = useOpenAIProvider();
  const BedrockProvider = useBedrockProvider();

  return useMemo(
    () => [
      OpenAIProvider,
      OllamaProvider,
      AzureProvider,
      GoogleProviderCard,
      AnthropicProviderCard,
      BedrockProvider,
      GroqProviderCard,
      OpenRouterProviderCard,
      NovitaProviderCard,
      TogetherAIProviderCard,
      QwenProviderCard,
      DeepSeekProviderCard,
      MinimaxProviderCard,
      MistralProviderCard,
      MoonshotProviderCard,
      PerplexityProviderCard,
      ZhiPuProviderCard,
      ZeroOneProviderCard,
      StepfunProviderCard,
      BaichuanProviderCard,
      TaichuProviderCard,
      Ai360ProviderCard,
      SiliconCloudProviderCard,
    ],
    [AzureProvider, OllamaProvider, OpenAIProvider, BedrockProvider],
  );
};
