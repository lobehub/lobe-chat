import { AIChatModelCard } from '@/types/aiModel';

// ref: https://cloud.google.com/vertex-ai/generative-ai/docs/learn/models
const vertexaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 2_097_152 + 8192,
    description:
      'Gemini 2.0 Pro Experimental 是 Google 最新的实验性多模态AI模型，与历史版本相比有一定的质量提升，特别是对于世界知识、代码和长上下文。',
    displayName: 'Gemini 2.0 Pro Experimental 02-05',
    enabled: true,
    id: 'gemini-2.0-pro-exp-02-05',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0,
      input: 0,
      output: 0,
    },
    releasedAt: '2025-02-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 8192,
    description:
      'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
    displayName: 'Gemini 2.0 Flash',
    enabled: true,
    id: 'gemini-2.0-flash',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.0375,
      input: 0.15,
      output: 0.6,
    },
    releasedAt: '2025-02-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 8192,
    description: 'Gemini 2.0 Flash 模型变体，针对成本效益和低延迟等目标进行了优化。',
    displayName: 'Gemini 2.0 Flash-Lite',
    id: 'gemini-2.0-flash-lite',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.018_75,
      input: 0.075,
      output: 0.3,
    },
    releasedAt: '2025-02-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 8192,
    description:
      'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
    displayName: 'Gemini 2.0 Flash 001',
    id: 'gemini-2.0-flash-001',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.0375,
      input: 0.15,
      output: 0.6,
    },
    releasedAt: '2025-02-05',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.0 Flash Thinking Exp 是 Google 的实验性多模态推理AI模型，能对复杂问题进行推理，拥有新的思维能力。',
    displayName: 'Gemini 2.0 Flash Thinking Experimental 01-21',
    enabled: true,
    id: 'gemini-2.0-flash-thinking-exp-01-21',
    maxOutput: 65_536,
    pricing: {
      cachedInput: 0,
      input: 0,
      output: 0,
    },
    releasedAt: '2025-01-21',
    type: 'chat',
  },
  {
    abilities: { functionCall: true, vision: true },
    contextWindowTokens: 1_000_000 + 8192,
    description: 'Gemini 1.5 Flash 002 是一款高效的多模态模型，支持广泛应用的扩展。',
    displayName: 'Gemini 1.5 Flash 002',
    id: 'gemini-1.5-flash-002',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.018_75,
      input: 0.075,
      output: 0.3,
    },
    releasedAt: '2024-09-25',
    type: 'chat',
  },
  {
    abilities: { functionCall: true, vision: true },
    contextWindowTokens: 1_000_000 + 8192,
    description: 'Gemini 1.5 Flash 001 是一款高效的多模态模型，支持广泛应用的扩展。',
    displayName: 'Gemini 1.5 Flash 001',
    id: 'gemini-1.5-flash-001',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.018_75,
      input: 0.075,
      output: 0.3,
    },
    type: 'chat',
  },
  {
    abilities: { functionCall: true, vision: true },
    contextWindowTokens: 2_000_000 + 8192,
    description:
      'Gemini 1.5 Pro 002 是最新的生产就绪模型，提供更高质量的输出，特别在数学、长上下文和视觉任务方面有显著提升。',
    displayName: 'Gemini 1.5 Pro 002',
    id: 'gemini-1.5-pro-002',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.315,
      input: 1.25,
      output: 2.5,
    },
    releasedAt: '2024-09-24',
    type: 'chat',
  },
  {
    abilities: { functionCall: true, vision: true },
    contextWindowTokens: 2_000_000 + 8192,
    description: 'Gemini 1.5 Pro 001 是可扩展的多模态AI解决方案，支持广泛的复杂任务。',
    displayName: 'Gemini 1.5 Pro 001',
    id: 'gemini-1.5-pro-001',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.875,
      input: 3.5,
      output: 10.5,
    },
    releasedAt: '2024-02-15',
    type: 'chat',
  },
];

export const allModels = [...vertexaiChatModels];

export default allModels;
