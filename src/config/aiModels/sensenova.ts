import { AIChatModelCard } from '@/types/aiModel';

const sensenovaChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      '最新版本模型 (V5.5)，128K上下文长度，在数学推理、英文对话、指令跟随以及长文本理解等领域能力显著提升，比肩GPT-4o',
    displayName: 'SenseChat 5.5',
    enabled: true,
    id: 'SenseChat-5',
    pricing: {
      currency: 'CNY',
      input: 40,
      output: 100,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '适用于快速问答、模型微调场景',
    displayName: 'SenseChat 5.0 Turbo',
    enabled: true,
    id: 'SenseChat-Turbo',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 5,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      '32K上下文长度，在粤语的对话理解上超越了GPT-4，在知识、推理、数学及代码编写等多个领域均能与GPT-4 Turbo相媲美',
    displayName: 'SenseChat 5.0 Cantonese',
    id: 'SenseChat-5-Cantonese',
    pricing: {
      currency: 'CNY',
      input: 27,
      output: 27,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '基础版本模型 (V4)，128K上下文长度，在长文本理解及生成等任务中表现出色',
    displayName: 'SenseChat 4.0 128K',
    enabled: true,
    id: 'SenseChat-128K',
    pricing: {
      currency: 'CNY',
      input: 60,
      output: 60,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '基础版本模型 (V4)，32K上下文长度，灵活应用于各类场景',
    displayName: 'SenseChat 4.0 32K',
    enabled: true,
    id: 'SenseChat-32K',
    pricing: {
      currency: 'CNY',
      input: 36,
      output: 36,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: '基础版本模型 (V4)，4K上下文长度，通用能力强大',
    displayName: 'SenseChat 4.0 4K',
    enabled: true,
    id: 'SenseChat',
    pricing: {
      currency: 'CNY',
      input: 12,
      output: 12,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '标准版模型，8K上下文长度，高响应速度',
    displayName: 'SenseChat Character',
    id: 'SenseChat-Character',
    pricing: {
      currency: 'CNY',
      input: 12,
      output: 12,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '高级版模型，32K上下文长度，能力全面提升，支持中/英文对话',
    displayName: 'SenseChat Character Pro',
    id: 'SenseChat-Character-Pro',
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 15,
    },
    type: 'chat',
  },
];

export const allModels = [...sensenovaChatModels];

export default allModels;
