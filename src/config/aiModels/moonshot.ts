import { AIChatModelCard } from '@/types/aiModel';

// https://platform.moonshot.cn/docs/pricing/chat
const moonshotChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Kimi 智能助手产品使用最新的 Kimi 大模型，可能包含尚未稳定的特性。支持图片理解，同时会自动根据请求的上下文长度选择 8k/32k/128k 模型作为计费模型',
    displayName: 'Kimi Latest',
    enabled: true,
    id: 'kimi-latest',
    pricing: {
      cachedInput: 1,
      currency: 'CNY',
      input: 10,
      output: 30,
    },
    releasedAt: '2025-02-17',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'kimi-thinking-preview 模型是月之暗面提供的具有多模态推理能力和通用推理能力的多模态思考模型，它擅长深度推理，帮助解决更多更难的事情',
    displayName: 'Kimi Thinking Preview',
    enabled: true,
    id: 'kimi-thinking-preview',
    pricing: {
      currency: 'CNY',
      input: 200,
      output: 200,
    },
    releasedAt: '2025-05-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description: 'Moonshot V1 Auto 可以根据当前上下文占用的 Tokens 数量来选择合适的模型',
    displayName: 'Moonshot V1 Auto',
    id: 'moonshot-v1-auto',
    pricing: {
      currency: 'CNY',
      input: 10,
      output: 30,
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 8192,
    description:
      'Moonshot V1 8K 专为生成短文本任务设计，具有高效的处理性能，能够处理8,192个tokens，非常适合简短对话、速记和快速内容生成。',
    displayName: 'Moonshot V1 8K',
    id: 'moonshot-v1-8k',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 10,
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Moonshot V1 32K 提供中等长度的上下文处理能力，能够处理32,768个tokens，特别适合生成各种长文档和复杂对话，应用于内容创作、报告生成和对话系统等领域。',
    displayName: 'Moonshot V1 32K',
    id: 'moonshot-v1-32k',
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 20,
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Moonshot V1 128K 是一款拥有超长上下文处理能力的模型，适用于生成超长文本，满足复杂的生成任务需求，能够处理多达128,000个tokens的内容，非常适合科研、学术和大型文档生成等应用场景。',
    displayName: 'Moonshot V1 128K',
    id: 'moonshot-v1-128k',
    pricing: {
      currency: 'CNY',
      input: 10,
      output: 30,
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 8192,
    description:
      'Kimi 视觉模型（包括 moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview 等）能够理解图片内容，包括图片文字、图片颜色和物体形状等内容。',
    displayName: 'Moonshot V1 8K Vision Preview',
    id: 'moonshot-v1-8k-vision-preview',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 10,
    },
    releasedAt: '2025-01-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Kimi 视觉模型（包括 moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview 等）能够理解图片内容，包括图片文字、图片颜色和物体形状等内容。',
    displayName: 'Moonshot V1 32K Vision Preview',
    id: 'moonshot-v1-32k-vision-preview',
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 20,
    },
    releasedAt: '2025-01-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Kimi 视觉模型（包括 moonshot-v1-8k-vision-preview/moonshot-v1-32k-vision-preview/moonshot-v1-128k-vision-preview 等）能够理解图片内容，包括图片文字、图片颜色和物体形状等内容。',
    displayName: 'Moonshot V1 128K Vision Preview',
    id: 'moonshot-v1-128k-vision-preview',
    pricing: {
      currency: 'CNY',
      input: 10,
      output: 30,
    },
    releasedAt: '2025-01-14',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
];

export const allModels = [...moonshotChatModels];

export default allModels;
