import { ModelProviderCard } from '@/types/llm';

const Azure: ModelProviderCard = {
  chatModels: [
    {
      deploymentName: 'gpt-35-turbo',
      description: 'GPT 3.5 Turbo，适用于各种文本生成和理解任务',
      displayName: 'GPT-3.5 Turbo',
      enabled: true,
      functionCall: true,
      id: 'gpt-35-turbo',
      maxOutput: 4096,
      tokens: 16_385,
    },
    {
      deploymentName: 'gpt-35-turbo-16k',
      displayName: 'GPT-3.5 Turbo',
      functionCall: true,
      id: 'gpt-35-turbo-16k',
      tokens: 16_384,
    },
    {
      deploymentName: 'gpt-4',
      displayName: 'GPT-4 Turbo Preview',
      enabled: true,
      functionCall: true,
      id: 'gpt-4',
      tokens: 128_000,
    },
    {
      description: 'GPT-4 视觉预览版，支持视觉任务',
      displayName: 'GPT-4 Turbo with Vision Preview',
      id: 'gpt-4-vision-preview',
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
      displayName: 'GPT-4 32K',
      functionCall: true,
      id: 'gpt-4-32k',
      tokens: 32_768,
    },
    {
      displayName: 'GPT-4 32K (0613)',
      functionCall: true,
      id: 'gpt-4-32k-0613',
      tokens: 32_768,
    },
    {
      displayName: 'GPT-4 ALL',
      files: true,
      functionCall: true,
      id: 'gpt-4-all',
      tokens: 32_768,
      vision: true,
    },
  ],
  id: 'azure',
};

export default Azure;
