import { ModelProviderCard } from '@/types/llm';

export const ZhiPuModelCard: ModelProviderCard = {
  chatModels: [
    {
      description: '最新的 GLM-4 、最大支持 128k 上下文、支持 Function Call 、Retreival',
      displayName: 'GLM-4',
      functionCall: true,
      id: 'glm-4',
      tokens: 128_000,
    },
    {
      description:
        '实现了视觉语言特征的深度融合，支持视觉问答、图像字幕、视觉定位、复杂目标检测等各类多模态理解任务',
      displayName: 'GLM-4 Vision',
      id: 'glm-4v',
      tokens: 128_000,
      vision: true,
    },
    {
      description: '最新的glm-3-turbo、最大支持 128k上下文、支持Function Call、Retreival',
      displayName: 'GLM-3 Turbo',
      functionCall: true,
      id: 'glm-3-turbo',
      tokens: 128_000,
    },
  ],
  id: 'zhipu',
};

// refs to: https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
export const OpenAIModelCard: ModelProviderCard = {
  chatModels: [
    {
      description: 'GPT 3.5 Turbo，适用于各种文本生成和理解任务',
      displayName: 'GPT-3.5 Turbo',
      functionCall: true,
      id: 'gpt-3.5-turbo',
      tokens: 4096,
    },
    {
      functionCall: true,
      id: 'gpt-3.5-turbo-1106',
      tokens: 16_385,
    },
    {
      functionCall: true,
      id: 'gpt-3.5-turbo-16k',
      tokens: 16_385,
    },
    {
      functionCall: true,
      id: 'gpt-4',
      tokens: 8196,
    },
    {
      functionCall: true,
      id: 'gpt-4-32k',
      tokens: 32_768,
    },
    {
      description: 'GPT-4 预览版，特定版本',
      displayName: 'GPT-4 Turbo (1106-preview)',
      functionCall: true,
      id: 'gpt-4-1106-preview',
      tokens: 128_000,
    },
    {
      description: 'GPT-4 视觉预览版，支持视觉任务',
      displayName: 'GPT-4 Vision (Preview)',
      id: 'gpt-4-vision-preview',
      tokens: 128_000,
      vision: true,
    },
  ],
  id: 'openai',
};
