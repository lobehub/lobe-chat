import { ModelProviderCard } from '@/types/llm';

// refs to: https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
const OpenAI: ModelProviderCard = {
  chatModels: [
    {
      description: 'GPT 3.5 Turbo，适用于各种文本生成和理解任务',
      displayName: 'GPT-3.5 Turbo',
      functionCall: true,
      id: 'gpt-3.5-turbo',
      tokens: 4096,
    },
    {
      displayName: 'GPT-3.5 Turbo (0125)',
      functionCall: true,
      id: 'gpt-3.5-turbo-0125',
      tokens: 16_385,
    },
    {
      displayName: 'GPT-3.5 Turbo (1106)',
      functionCall: true,
      hidden: true,
      id: 'gpt-3.5-turbo-1106',
      tokens: 16_385,
    },
    {
      hidden: true,
      id: 'gpt-3.5-turbo-instruct',
      tokens: 4096,
    },
    {
      displayName: 'GPT-3.5 Turbo 16K',
      hidden: true,
      id: 'gpt-3.5-turbo-16k',
      tokens: 16_385,
    },
    {
      hidden: true,
      id: 'gpt-3.5-turbo-0613',
      legacy: true,
      tokens: 4096,
    },
    {
      hidden: true,
      id: 'gpt-3.5-turbo-16k-0613',
      legacy: true,
      tokens: 4096,
    },
    {
      displayName: 'GPT-4 Turbo Preview',
      functionCall: true,
      id: 'gpt-4-turbo-preview',
      tokens: 128_000,
    },
    {
      displayName: 'GPT-4 Turbo Preview (0125)',
      functionCall: true,
      id: 'gpt-4-0125-preview',
      tokens: 128_000,
    },
    {
      description: 'GPT-4 视觉预览版，支持视觉任务',
      displayName: 'GPT-4 Turbo Vision (Preview)',
      id: 'gpt-4-vision-preview',
      tokens: 128_000,
      vision: true,
    },
    {
      displayName: 'GPT-4 Turbo Preview (1106)',
      functionCall: true,
      hidden: true,
      id: 'gpt-4-1106-preview',
      tokens: 128_000,
    },
    {
      displayName: 'GPT-4',
      functionCall: true,
      hidden: true,
      id: 'gpt-4',
      tokens: 8192,
    },
    {
      functionCall: true,
      hidden: true,
      id: 'gpt-4-0613',
      tokens: 8192,
    },
    {
      functionCall: true,
      hidden: true,
      id: 'gpt-4-32k',
      tokens: 32_768,
    },
    {
      functionCall: true,
      hidden: true,
      id: 'gpt-4-32k-0613',
      tokens: 32_768,
    },
    {
      files: true,
      functionCall: true,
      hidden: true,
      id: 'gpt-4-all',
      tokens: 32_768,
      vision: true,
    },
  ],
  enabled: true,
  id: 'openai',
};

export default OpenAI;
