import { AIChatModelCard } from '@/types/aiModel';

const stepfunChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
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
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 32_000,
    description: '支持视觉输入，增强多模态交互体验。',
    displayName: 'Step 1V 32K',
    enabled: true,
    id: 'step-1v-32k',
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 70,
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
];

export const allModels = [...stepfunChatModels];

export default allModels;
