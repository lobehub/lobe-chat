import { AIChatModelCard } from '@/types/aiModel';

const moonshotChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      'Moonshot V1 8K 专为生成短文本任务设计，具有高效的处理性能，能够处理8,192个tokens，非常适合简短对话、速记和快速内容生成。',
    displayName: 'Moonshot V1 8K',
    enabled: true,
    id: 'moonshot-v1-8k',
    pricing: {
      currency: 'CNY',
      input: 12,
      output: 12,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Moonshot V1 32K 提供中等长度的上下文处理能力，能够处理32,768个tokens，特别适合生成各种长文档和复杂对话，应用于内容创作、报告生成和对话系统等领域。',
    displayName: 'Moonshot V1 32K',
    enabled: true,
    id: 'moonshot-v1-32k',
    pricing: {
      currency: 'CNY',
      input: 24,
      output: 24,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Moonshot V1 128K 是一款拥有超长上下文处理能力的模型，适用于生成超长文本，满足复杂的生成任务需求，能够处理多达128,000个tokens的内容，非常适合科研、学术和大型文档生成等应用场景。',
    displayName: 'Moonshot V1 128K',
    enabled: true,
    id: 'moonshot-v1-128k',
    pricing: {
      currency: 'CNY',
      input: 60,
      output: 60,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 8192,
    description:
      'Kimi 视觉模型（包括 moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview 等）能够理解图片内容，包括图片文字、图片颜色和物体形状等内容。',
    displayName: 'Moonshot V1 8K Vision Preview',
    enabled: true,
    id: 'moonshot-v1-8k-vision-preview',
    pricing: {
      currency: 'CNY',
      input: 12,
      output: 12,
    },
    releasedAt: '2025-01-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Kimi 视觉模型（包括 moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview 等）能够理解图片内容，包括图片文字、图片颜色和物体形状等内容。',
    displayName: 'Moonshot V1 32K Vision Preview',
    enabled: true,
    id: 'moonshot-v1-32k-vision-preview',
    pricing: {
      currency: 'CNY',
      input: 24,
      output: 24,
    },
    releasedAt: '2025-01-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Kimi 视觉模型（包括 moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview 等）能够理解图片内容，包括图片文字、图片颜色和物体形状等内容。',
    displayName: 'Moonshot V1 128K Vision Preview',
    enabled: true,
    id: 'moonshot-v1-128k-vision-preview',
    pricing: {
      currency: 'CNY',
      input: 60,
      output: 60,
    },
    releasedAt: '2025-01-14',
    type: 'chat',
  },
];

export const allModels = [...moonshotChatModels];

export default allModels;
