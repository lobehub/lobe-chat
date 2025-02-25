import { AIChatModelCard } from '@/types/aiModel';

// https://platform.stepfun.com/docs/pricing/details

const stepfunChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 8000,
    description: '高速模型，适合实时对话。',
    displayName: 'Step 1 Flash',
    enabled: true,
    id: 'step-1-flash',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
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
    contextWindowTokens: 8000,
    description: '小型模型，适合轻量级任务。',
    displayName: 'Step 1 8K',
    enabled: true,
    id: 'step-1-8k',
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
    contextWindowTokens: 32_000,
    description: '支持中等长度的对话，适用于多种应用场景。',
    displayName: 'Step 1 32K',
    enabled: true,
    id: 'step-1-32k',
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 70,
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
    contextWindowTokens: 128_000,
    description: '平衡性能与成本，适合一般场景。',
    displayName: 'Step 1 128K',
    enabled: true,
    id: 'step-1-128k',
    pricing: {
      currency: 'CNY',
      input: 40,
      output: 200,
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
    contextWindowTokens: 256_000,
    description: '具备超长上下文处理能力，尤其适合长文档分析。',
    displayName: 'Step 1 256K',
    id: 'step-1-256k',
    pricing: {
      currency: 'CNY',
      input: 95,
      output: 300,
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
    contextWindowTokens: 16_000,
    description: '支持大规模上下文交互，适合复杂对话场景。',
    displayName: 'Step 2 16K',
    enabled: true,
    id: 'step-2-16k',
    pricing: {
      currency: 'CNY',
      input: 38,
      output: 120,
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
    contextWindowTokens: 8000,
    description: 
      '基于新一代自研Attention架构MFA的极速大模型，用极低成本达到和step1类似的效果，同时保持了更高的吞吐和更快响应时延。能够处理通用任务，在代码能力上具备特长。',
    displayName: 'Step 2 Mini',
    enabled: true,
    id: 'step-2-mini',
      pricing: {
      currency: 'CNY',
      input: 1,
      output: 2,
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
    },
    contextWindowTokens: 16_000,
    description: 'step-2模型的实验版本，包含最新的特性，滚动更新中。不推荐在正式生产环境使用。',
    displayName: 'Step 2 16K Exp',
    enabled: true,
    id: 'step-2-16k',
    pricing: {
      currency: 'CNY',
      input: 38,
      output: 120,
    },
    releasedAt: '2025-01-15',
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
    contextWindowTokens: 8000,
    description: '小型视觉模型，适合基本的图文任务。',
    displayName: 'Step 1V 8K',
    enabled: true,
    id: 'step-1v-8k',
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
      vision: true,
    },
    contextWindowTokens: 32_000,
    description: '支持视觉输入，增强多模态交互体验。',
    displayName: 'Step 1V 32K',
    id: 'step-1v-32k',
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 70,
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
    contextWindowTokens: 32_000,
    description: '该模型拥有强大的图像理解能力。相比于 step-1v 系列模型，拥有更强的视觉性能。',
    displayName: 'Step 1o Vision 32K',
    enabled: true,
    id: 'step-1o-vision-32k',
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 70,
    },
    releasedAt: '2025-01-22',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_000,
    description: '该模型拥有强大的视频理解能力。',
    displayName: 'Step 1.5V Mini',
    enabled: true,
    id: 'step-1.5v-mini',
    pricing: {
      currency: 'CNY',
      input: 8,
      output: 35,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_000,
    description: '该模型拥有强大的图像理解能力，在数理、代码领域强于1o。模型比1o更小，输出速度更快。',
    displayName: 'Step 1o Turbo Vision',
    enabled: true,
    id: 'step-1o-turbo-vision',
    pricing: {
      currency: 'CNY',
      input: 8,
      output: 35,
    },
    releasedAt: '2025-02-14',
    type: 'chat',
  },
];

export const allModels = [...stepfunChatModels];

export default allModels;
