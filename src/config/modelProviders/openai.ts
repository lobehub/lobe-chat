import { ModelProviderCard } from '@/types/llm';

// ref:
// https://platform.openai.com/docs/models
// https://platform.openai.com/docs/deprecations
const OpenAI: ModelProviderCard = {
  chatModels: [
    {
      description: 'Currently points to gpt-4o-mini-2024-07-18',
      displayName: 'GPT-4o mini',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o-mini',
      maxOutput: 16_385,
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Currently points to gpt-4o-2024-05-13',
      displayName: 'GPT-4o',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o',
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Latest GPT-4o snapshot that supports Structured Outputs',
      displayName: 'GPT-4o (240806)',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o-2024-08-06',
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Dynamic model continuously updated to the current version of GPT-4o in ChatGPT',
      displayName: 'ChatGPT-4o',
      enabled: true,
      id: 'chatgpt-4o-latest',
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'GPT-4 Turbo with Vision',
      displayName: 'GPT-4 Turbo',
      functionCall: true,
      id: 'gpt-4-turbo',
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'GPT-4 Turbo 视觉版 (240409)',
      displayName: 'GPT-4 Turbo Vision (240409)',
      functionCall: true,
      id: 'gpt-4-turbo-2024-04-09',
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Currently points to gpt-4-0125-preview',
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
      description: 'Currently points to gpt-4-1106-vision-preview', // Will be discontinued on December 6, 2024
      displayName: 'GPT-4 Turbo Vision Preview',
      id: 'gpt-4-vision-preview',
      tokens: 128_000,
      vision: true,
    },
    {
      displayName: 'GPT-4 Turbo Vision Preview (1106)', // Will be discontinued on December 6, 2024
      id: 'gpt-4-1106-vision-preview',
      tokens: 128_000,
      vision: true,
    },
    {
      displayName: 'GPT-4 Turbo Preview (1106)',
      functionCall: true,
      id: 'gpt-4-1106-preview',
      tokens: 128_000,
    },
    {
      description: 'Currently points to gpt-4-0613',
      displayName: 'GPT-4',
      functionCall: true,
      id: 'gpt-4',
      tokens: 8192,
    },
    {
      displayName: 'GPT-4 (0613)',
      functionCall: true,
      id: 'gpt-4-0613',
      tokens: 8192,
    },
    {
      description: 'Currently points to gpt-4-32k-0613', // Will be discontinued on June 6, 2025
      displayName: 'GPT-4 32K',
      functionCall: true,
      id: 'gpt-4-32k',
      tokens: 32_768,
    },
    {
      displayName: 'GPT-4 32K (0613)', // Will be discontinued on June 6, 2025
      functionCall: true,
      id: 'gpt-4-32k-0613',
      tokens: 32_768,
    },
    {
      description:
        'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
      displayName: 'GPT-3.5 Turbo',
      functionCall: true,
      id: 'gpt-3.5-turbo',
      tokens: 16_385,
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
      id: 'gpt-3.5-turbo-1106',
      tokens: 16_385,
    },
    {
      displayName: 'GPT-3.5 Turbo Instruct',
      id: 'gpt-3.5-turbo-instruct',
      tokens: 4096,
    },
    {
      description: 'Currently points to gpt-3.5-turbo-16k-0613', // Will be discontinued on September 13, 2024
      displayName: 'GPT-3.5 Turbo 16K',
      id: 'gpt-3.5-turbo-16k',
      legacy: true,
      tokens: 16_385,
    },
    {
      displayName: 'GPT-3.5 Turbo (0613)', // Will be discontinued on September 13, 2024
      id: 'gpt-3.5-turbo-0613',
      legacy: true,
      tokens: 4096,
    },
    {
      description: 'Currently points to gpt-3.5-turbo-16k-0613', // Will be discontinued on September 13, 2024
      id: 'gpt-3.5-turbo-16k-0613',
      legacy: true,
      tokens: 16_385,
    },
  ],
  checkModel: 'gpt-4o-mini',
  enabled: true,
  id: 'openai',
  modelList: { showModelFetcher: true },
  name: 'OpenAI',
};

export default OpenAI;
