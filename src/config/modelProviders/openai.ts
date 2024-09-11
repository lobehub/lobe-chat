import { ModelProviderCard } from '@/types/llm';

// ref:
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
      pricing: {
        input: 0.15,
        output: 0.6,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Currently points to gpt-4o-2024-05-13',
      displayName: 'GPT-4o',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o',
      pricing: {
        input: 5,
        output: 15,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Latest GPT-4o snapshot that supports Structured Outputs',
      displayName: 'GPT-4o (240806)',
      enabled: true,
      functionCall: true,
      id: 'gpt-4o-2024-08-06',
      pricing: {
        input: 2.5,
        output: 10,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Latest GPT-4o snapshot that supports Structured Outputs',
      displayName: 'GPT-4o (240513)',
      functionCall: true,
      id: 'gpt-4o-2024-05-13',
      pricing: {
        input: 5,
        output: 15,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Dynamic model continuously updated to the current version of GPT-4o in ChatGPT',
      displayName: 'ChatGPT-4o',
      enabled: true,
      id: 'chatgpt-4o-latest',
      pricing: {
        input: 5,
        output: 15,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'GPT-4 Turbo with Vision',
      displayName: 'GPT-4 Turbo',
      functionCall: true,
      id: 'gpt-4-turbo',
      pricing: {
        input: 10,
        output: 30,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'GPT-4 Turbo 视觉版 (240409)',
      displayName: 'GPT-4 Turbo Vision (240409)',
      functionCall: true,
      id: 'gpt-4-turbo-2024-04-09',
      pricing: {
        input: 10,
        output: 30,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      description: 'Currently points to gpt-4-0125-preview',
      displayName: 'GPT-4 Turbo Preview',
      functionCall: true,
      id: 'gpt-4-turbo-preview',
      pricing: {
        input: 10,
        output: 30,
      },
      tokens: 128_000,
    },
    {
      displayName: 'GPT-4 Turbo Preview (0125)',
      functionCall: true,
      id: 'gpt-4-0125-preview',
      pricing: {
        input: 10,
        output: 30,
      },
      tokens: 128_000,
    },
    {
      description: 'Currently points to gpt-4-1106-vision-preview', // Will be discontinued on December 6, 2024
      displayName: 'GPT-4 Turbo Vision Preview',
      id: 'gpt-4-vision-preview',
      pricing: {
        input: 10,
        output: 30,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      displayName: 'GPT-4 Turbo Vision Preview (1106)', // Will be discontinued on December 6, 2024
      id: 'gpt-4-1106-vision-preview',
      pricing: {
        input: 10,
        output: 30,
      },
      tokens: 128_000,
      vision: true,
    },
    {
      displayName: 'GPT-4 Turbo Preview (1106)',
      functionCall: true,
      id: 'gpt-4-1106-preview',
      pricing: {
        input: 10,
        output: 30,
      },
      tokens: 128_000,
    },
    {
      description: 'Currently points to gpt-4-0613',
      displayName: 'GPT-4',
      functionCall: true,
      id: 'gpt-4',
      pricing: {
        input: 30,
        output: 60,
      },
      tokens: 8192,
    },
    {
      displayName: 'GPT-4 (0613)',
      functionCall: true,
      id: 'gpt-4-0613',
      pricing: {
        input: 30,
        output: 60,
      },
      tokens: 8192,
    },
    {
      description: 'Currently points to gpt-4-32k-0613', // Will be discontinued on June 6, 2025
      displayName: 'GPT-4 32K',
      functionCall: true,
      id: 'gpt-4-32k',
      pricing: {
        input: 60,
        output: 120,
      },
      tokens: 32_768,
    },
    {
      displayName: 'GPT-4 32K (0613)', // Will be discontinued on June 6, 2025
      functionCall: true,
      id: 'gpt-4-32k-0613',
      pricing: {
        input: 60,
        output: 120,
      },
      tokens: 32_768,
    },
    {
      description:
        'GPT 3.5 Turbo，适用于各种文本生成和理解任务，Currently points to gpt-3.5-turbo-0125',
      displayName: 'GPT-3.5 Turbo',
      functionCall: true,
      id: 'gpt-3.5-turbo',
      pricing: {
        input: 0.5,
        output: 1.5,
      },
      tokens: 16_385,
    },
    {
      displayName: 'GPT-3.5 Turbo (0125)',
      functionCall: true,
      id: 'gpt-3.5-turbo-0125',
      pricing: {
        input: 0.5,
        output: 1.5,
      },
      tokens: 16_385,
    },
    {
      displayName: 'GPT-3.5 Turbo (1106)',
      functionCall: true,
      id: 'gpt-3.5-turbo-1106',
      pricing: {
        input: 1,
        output: 2,
      },
      tokens: 16_385,
    },
    {
      displayName: 'GPT-3.5 Turbo Instruct',
      id: 'gpt-3.5-turbo-instruct',
      pricing: {
        input: 1.5,
        output: 2,
      },
      tokens: 4096,
    },
    {
      description: 'Currently points to gpt-3.5-turbo-16k-0613', // Will be discontinued on September 13, 2024
      displayName: 'GPT-3.5 Turbo 16K',
      id: 'gpt-3.5-turbo-16k',
      legacy: true,
      pricing: {
        input: 3,
        output: 4,
      },
      tokens: 16_385,
    },
    {
      displayName: 'GPT-3.5 Turbo (0613)', // Will be discontinued on September 13, 2024
      id: 'gpt-3.5-turbo-0613',
      legacy: true,
      pricing: {
        input: 1.5,
        output: 2,
      },
      tokens: 4096,
    },
    {
      description: 'Currently points to gpt-3.5-turbo-16k-0613', // Will be discontinued on September 13, 2024
      id: 'gpt-3.5-turbo-16k-0613',
      legacy: true,
      pricing: {
        input: 3,
        output: 4,
      },
      tokens: 16_385,
    },
  ],
  checkModel: 'gpt-4o-mini',
  enabled: true,
  id: 'openai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.openai.com/docs/models',
  name: 'OpenAI',
  url: 'https://openai.com',
};

export default OpenAI;
