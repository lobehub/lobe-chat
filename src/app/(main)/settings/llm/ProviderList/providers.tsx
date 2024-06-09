import {
  Anthropic,
  Claude,
  DeepSeek,
  Gemini,
  Google,
  Groq,
  Minimax,
  Mistral,
  Moonshot,
  OpenRouter,
  Perplexity,
  Together,
  Tongyi,
  ZeroOne,
  Zhipu,
} from '@lobehub/icons';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import { useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import {
  AnthropicProviderCard,
  DeepSeekProviderCard,
  GoogleProviderCard,
  GroqProviderCard,
  MinimaxProviderCard,
  MistralProviderCard,
  MoonshotProviderCard,
  OpenRouterProviderCard,
  PerplexityProviderCard,
  QwenProviderCard,
  TogetherAIProviderCard,
  ZeroOneProviderCard,
  ZhiPuProviderCard,
} from '@/config/modelProviders';

import { ProviderItem } from '../type';
import { useAzureProvider } from './Azure';
import { useBedrockProvider } from './Bedrock';
import { useOllamaProvider } from './Ollama';
import { useOpenAIProvider } from './OpenAI';

const AnthropicBrand = () => {
  const { isDarkMode } = useTheme();
  return <Anthropic.Text color={isDarkMode ? undefined : Claude.colorPrimary} size={15} />;
};

const MoonshotBrand = () => {
  const theme = useTheme();
  return (
    <Moonshot.Combine
      color={theme.isDarkMode ? theme.colorText : Moonshot.colorPrimary}
      size={22}
    />
  );
};

const GroqBrand = () => {
  const theme = useTheme();

  return <Groq.Text color={theme.isDarkMode ? theme.colorText : Groq.colorPrimary} size={20} />;
};

const GoogleBrand = () => (
  <Flexbox align={'center'} gap={8} horizontal>
    <Google.BrandColor size={22} />
    <Divider style={{ margin: '0 4px' }} type={'vertical'} />
    <Gemini.Combine size={22} type={'color'} />
  </Flexbox>
);

export const useProviderList = (): ProviderItem[] => {
  const azureProvider = useAzureProvider();
  const ollamaProvider = useOllamaProvider();
  const openAIProvider = useOpenAIProvider();
  const bedrockProvider = useBedrockProvider();

  return useMemo(
    () => [
      openAIProvider,
      ollamaProvider,
      azureProvider,
      {
        ...GoogleProviderCard,
        title: <GoogleBrand />,
      },
      {
        ...AnthropicProviderCard,
        title: <AnthropicBrand />,
      },
      bedrockProvider,
      {
        ...GroqProviderCard,
        title: <GroqBrand />,
      },
      {
        ...OpenRouterProviderCard,
        title: <OpenRouter.Combine iconProps={{ color: OpenRouter.colorPrimary }} size={20} />,
      },
      {
        ...TogetherAIProviderCard,
        title: <Together.Combine size={26} type={'color'} />,
      },
      {
        ...QwenProviderCard,
        title: <Tongyi.Combine extra={'千问'} size={26} type={'color'} />,
      },
      {
        ...DeepSeekProviderCard,
        title: <DeepSeek.Combine size={28} type={'color'} />,
      },
      {
        ...MinimaxProviderCard,
        title: <Minimax.Combine size={32} type={'color'} />,
      },
      {
        ...MistralProviderCard,
        title: <Mistral.Combine size={26} type={'color'} />,
      },
      {
        ...MoonshotProviderCard,
        title: <MoonshotBrand />,
      },
      {
        ...PerplexityProviderCard,
        title: <Perplexity.Combine size={24} type={'color'} />,
      },
      {
        ...ZhiPuProviderCard,
        title: <Zhipu.Combine size={32} type={'color'} />,
      },
      {
        ...ZeroOneProviderCard,
        title: <ZeroOne.Text size={20} />,
      },
    ],
    [azureProvider, ollamaProvider, ollamaProvider, bedrockProvider],
  );
};
