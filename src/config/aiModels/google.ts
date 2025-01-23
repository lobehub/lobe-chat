import { AIChatModelCard } from '@/types/aiModel';

const googleChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.0 Flash Exp 是 Google 最新的实验性多模态AI模型，拥有下一代特性，卓越的速度，原生工具调用以及多模态生成。',
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
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 40_959,
    description:
      'Gemini 2.0 Flash Exp 是 Google 最新的实验性多模态AI模型，拥有下一代特性，卓越的速度，原生工具调用以及多模态生成。',
    displayName: 'Gemini 2.0 Flash Thinking Experimental 1219',
    id: 'gemini-2.0-flash-thinking-exp-1219',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0,
      input: 0,
      output: 0,
    },
    releasedAt: '2024-12-19',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_056_768,
    description:
      'Gemini 2.0 Flash Exp 是 Google 最新的实验性多模态AI模型，拥有下一代特性，卓越的速度，原生工具调用以及多模态生成。',
    displayName: 'Gemini 2.0 Flash Experimental',
    enabled: true,
    id: 'gemini-2.0-flash-exp',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0,
      input: 0,
      output: 0,
    },
    releasedAt: '2024-12-11',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 2_105_344,
    description:
      'Gemini Exp 1206 是 Google 最新的实验性多模态AI模型，与历史版本相比有一定的质量提升。',
    displayName: 'Gemini Experimental 1206',
    enabled: true,
    id: 'gemini-exp-1206',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0,
      input: 0,
      output: 0,
    },
    releasedAt: '2024-12-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 40_959,
    description: 'Gemini Exp 1121 是 Google 的实验性多模态AI模型，拥有改进的编码、推理和视觉能力。',
    displayName: 'Gemini Experimental 1121',
    id: 'gemini-exp-1121',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0,
      input: 0,
      output: 0,
    },
    releasedAt: '2024-11-21',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 40_959,
    description: 'Gemini Exp 1114 是 Google 的实验性多模态AI模型，对输出质量有一定改进。',
    displayName: 'Gemini Experimental 1114',
    id: 'gemini-exp-1114',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0,
      input: 0,
      output: 0,
    },
    releasedAt: '2024-11-14',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 40_959,
    description:
      'LearnLM 是一个实验性的、特定于任务的语言模型，经过训练以符合学习科学原则，可在教学和学习场景中遵循系统指令，充当专家导师等。',
    displayName: 'LearnLM 1.5 Pro Experimental',
    id: 'learnlm-1.5-pro-experimental',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0,
      input: 0,
      output: 0,
    },
    releasedAt: '2024-11-19',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_008_192,
    description:
      'Gemini 1.5 Flash 是 Google 最新的多模态AI模型，具备快速处理能力，支持文本、图像和视频输入，适用于多种任务的高效扩展。',
    displayName: 'Gemini 1.5 Flash',
    enabled: true,
    id: 'gemini-1.5-flash-latest',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.018_75,
      input: 0.075,
      output: 0.3,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_008_192,
    description: 'Gemini 1.5 Flash 002 是一款高效的多模态模型，支持广泛应用的扩展。',
    displayName: 'Gemini 1.5 Flash 002',
    enabled: true,
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
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_008_192,
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
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 2_008_192,
    description:
      'Gemini 1.5 Pro 支持高达200万个tokens，是中型多模态模型的理想选择，适用于复杂任务的多方面支持。',
    displayName: 'Gemini 1.5 Pro',
    enabled: true,
    id: 'gemini-1.5-pro-latest',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.875,
      input: 3.5,
      output: 10.5,
    },
    releasedAt: '2024-02-15',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 2_008_192,
    description:
      'Gemini 1.5 Pro 002 是最新的生产就绪模型，提供更高质量的输出，特别在数学、长上下文和视觉任务方面有显著提升。',
    displayName: 'Gemini 1.5 Pro 002',
    enabled: true,
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
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 2_008_192,
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
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_008_192,
    description: 'Gemini 1.5 Flash 8B 是一款高效的多模态模型，支持广泛应用的扩展。',
    displayName: 'Gemini 1.5 Flash 8B',
    enabled: true,
    id: 'gemini-1.5-flash-8b',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.02,
      input: 0.075,
      output: 0.3,
    },
    releasedAt: '2024-10-03',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_008_192,
    description:
      'Gemini 1.5 Flash 8B 0924 是最新的实验性模型，在文本和多模态用例中都有显著的性能提升。',
    displayName: 'Gemini 1.5 Flash 8B 0924',
    id: 'gemini-1.5-flash-8b-exp-0924',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.018_75,
      input: 0.075,
      output: 0.3,
    },
    releasedAt: '2024-09-24',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Gemini 1.0 Pro 是Google的高性能AI模型，专为广泛任务扩展而设计。',
    displayName: 'Gemini 1.0 Pro',
    id: 'gemini-1.0-pro-latest',
    maxOutput: 2048,
    pricing: {
      input: 0.5,
      output: 1.5,
    },
    releasedAt: '2023-12-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Gemini 1.0 Pro 001 (Tuning) 提供稳定并可调优的性能，是复杂任务解决方案的理想选择。',
    displayName: 'Gemini 1.0 Pro 001 (Tuning)',
    id: 'gemini-1.0-pro-001',
    maxOutput: 2048,
    pricing: {
      input: 0.5,
      output: 1.5,
    },
    releasedAt: '2023-12-06',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Gemini 1.0 Pro 002 (Tuning) 提供出色的多模态支持，专注于复杂任务的有效解决。',
    displayName: 'Gemini 1.0 Pro 002 (Tuning)',
    id: 'gemini-1.0-pro-002',
    maxOutput: 2048,
    pricing: {
      input: 0.5,
      output: 1.5,
    },
    releasedAt: '2023-12-06',
    type: 'chat',
  },
];

export const allModels = [...googleChatModels];

export default allModels;
