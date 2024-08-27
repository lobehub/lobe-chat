import { useMemo } from 'react';
import urlJoin from 'url-join';

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

const BASE_DOC_URL = 'https://lobehub.com/docs/usage/providers';

export const useProviderList = (): ProviderItem[] => {
  const azureProvider = useAzureProvider();
  const ollamaProvider = useOllamaProvider();
  const openAIProvider = useOpenAIProvider();
  const bedrockProvider = useBedrockProvider();

  return useMemo(
    () => [
      {
        ...openAIProvider,
        docUrl: urlJoin(BASE_DOC_URL, 'openai'),
      },
      {
        ...ollamaProvider,
        docUrl: urlJoin(BASE_DOC_URL, 'ollama'),
      },
      {
        ...azureProvider,
        docUrl: urlJoin(BASE_DOC_URL, 'azure'),
      },
      {
        ...GoogleProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'gemini'),
      },
      {
        ...AnthropicProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'anthropic'),
      },
      {
        ...bedrockProvider,
        docUrl: urlJoin(BASE_DOC_URL, 'bedrock'),
      },
      {
        ...GroqProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'groq'),
      },
      {
        ...OpenRouterProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'openrouter'),
      },
      {
        ...NovitaProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'novita'),
      },
      {
        ...TogetherAIProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'togetherai'),
      },
      {
        ...QwenProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'qwen'),
      },
      {
        ...DeepSeekProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'deepseek'),
      },
      {
        ...MinimaxProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'minimax'),
      },
      {
        ...MistralProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'mistral'),
      },
      {
        ...MoonshotProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'moonshot'),
      },
      {
        ...PerplexityProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'perplexity'),
      },
      {
        ...ZhiPuProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'zhipu'),
      },
      {
        ...ZeroOneProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, '01ai'),
      },
      {
        ...StepfunProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'stepfun'),
      },
      {
        ...BaichuanProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'baichuan'),
      },
      {
        ...TaichuProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'taichu'),
      },
      {
        ...Ai360ProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'ai360'),
      },
      {
        ...SiliconCloudProviderCard,
        docUrl: urlJoin(BASE_DOC_URL, 'siliconcloud'),
      },
    ],
    [azureProvider, ollamaProvider, ollamaProvider, bedrockProvider],
  );
};
