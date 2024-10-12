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
import { useHuggingFaceProvider } from './HuggingFace';
import { useOllamaProvider } from './Ollama';
import { useOpenAIProvider } from './OpenAI';
import { useWenxinProvider } from './Wenxin';
import { useSenseNovaProvider } from './SenseNova';

export const useProviderList = (): ProviderItem[] => {
  const AzureProvider = useAzureProvider();
  const OllamaProvider = useOllamaProvider();
  const OpenAIProvider = useOpenAIProvider();
  const BedrockProvider = useBedrockProvider();
  const GithubProvider = useGithubProvider();
  const HuggingFaceProvider = useHuggingFaceProvider();
  const WenxinProvider = useWenxinProvider();
  const SenseNovaProvider = useSenseNovaProvider();

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
      WenxinProvider,
      HunyuanProviderCard,
      SparkProviderCard,
      ZhiPuProviderCard,
      ZeroOneProviderCard,
      SenseNovaProvider,
      StepfunProviderCard,
      MoonshotProviderCard,
      BaichuanProviderCard,
      MinimaxProviderCard,
      Ai360ProviderCard,
      TaichuProviderCard,
      SiliconCloudProviderCard,
    ],
    [
      AzureProvider,
      OllamaProvider,
      OpenAIProvider,
      BedrockProvider,
      GithubProvider,
      WenxinProvider,
      HuggingFaceProvider,
      SenseNovaProvider,
    ],
  );
};
