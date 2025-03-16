import { AIChatModelCard } from '@/types/aiModel';

const anthropicChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.7 Sonnet 是 Anthropic 迄今为止最智能的模型，也是市场上首个混合推理模型。Claude 3.7 Sonnet 可以产生近乎即时的响应或延长的逐步思考，用户可以清晰地看到这些过程。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
    displayName: 'Claude 3.7 Sonnet 0219',
    enabled: true,
    id: 'claude-3-7-sonnet-20250219',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.3,
      input: 3,
      output: 15,
      writeCacheInput: 3.75,
    },
    releasedAt: '2025-02-24',
    settings: {
      extendParams: ['disableContextCaching', 'enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Haiku 是 Anthropic 最快的下一代模型。与 Claude 3 Haiku 相比，Claude 3.5 Haiku 在各项技能上都有所提升，并在许多智力基准测试中超越了上一代最大的模型 Claude 3 Opus。',
    displayName: 'Claude 3.5 Haiku',
    enabled: true,
    id: 'claude-3-5-haiku-20241022',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.1,
      input: 1,
      output: 5,
      writeCacheInput: 1.25,
    },
    releasedAt: '2024-11-05',
    settings: {
      extendParams: ['disableContextCaching'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提供了超越 Opus 的能力和比 Sonnet 更快的速度，同时保持与 Sonnet 相同的价格。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
    displayName: 'Claude 3.5 Sonnet',
    enabled: true,
    id: 'claude-3-5-sonnet-20241022',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.3,
      input: 3,
      output: 15,
      writeCacheInput: 3.75,
    },
    releasedAt: '2024-10-22',
    settings: {
      extendParams: ['disableContextCaching'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3.5 Sonnet 提供了超越 Opus 的能力和比 Sonnet 更快的速度，同时保持与 Sonnet 相同的价格。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
    displayName: 'Claude 3.5 Sonnet 0620',
    id: 'claude-3-5-sonnet-20240620',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.3,
      input: 3,
      output: 15,
      writeCacheInput: 3.75,
    },
    releasedAt: '2024-06-20',
    settings: {
      extendParams: ['disableContextCaching'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3 Haiku 是 Anthropic 的最快且最紧凑的模型，旨在实现近乎即时的响应。它具有快速且准确的定向性能。',
    displayName: 'Claude 3 Haiku',
    id: 'claude-3-haiku-20240307',
    maxOutput: 4096,
    pricing: {
      input: 0.25,
      output: 1.25,
    },
    releasedAt: '2024-03-07',
    settings: {
      extendParams: ['disableContextCaching'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3 Sonnet 在智能和速度方面为企业工作负载提供了理想的平衡。它以更低的价格提供最大效用，可靠且适合大规模部署。',
    displayName: 'Claude 3 Sonnet',
    id: 'claude-3-sonnet-20240229',
    maxOutput: 4096,
    pricing: {
      input: 3,
      output: 15,
    },
    releasedAt: '2024-02-29',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude 3 Opus 是 Anthropic 用于处理高度复杂任务的最强大模型。它在性能、智能、流畅性和理解力方面表现卓越。',
    displayName: 'Claude 3 Opus',
    enabled: true,
    id: 'claude-3-opus-20240229',
    maxOutput: 4096,
    pricing: {
      input: 15,
      output: 75,
    },
    releasedAt: '2024-02-29',
    settings: {
      extendParams: ['disableContextCaching'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 200_000,
    description:
      'Claude 2 为企业提供了关键能力的进步，包括业界领先的 200K token 上下文、大幅降低模型幻觉的发生率、系统提示以及一个新的测试功能：工具调用。',
    displayName: 'Claude 2.1',
    id: 'claude-2.1',
    maxOutput: 4096,
    pricing: {
      input: 8,
      output: 24,
    },
    releasedAt: '2023-11-21',
    type: 'chat',
  },
  {
    contextWindowTokens: 100_000,
    description:
      'Claude 2 为企业提供了关键能力的进步，包括业界领先的 200K token 上下文、大幅降低模型幻觉的发生率、系统提示以及一个新的测试功能：工具调用。',
    displayName: 'Claude 2.0',
    id: 'claude-2.0',
    maxOutput: 4096,
    pricing: {
      input: 8,
      output: 24,
    },
    releasedAt: '2023-07-11',
    type: 'chat',
  },
];

export const allModels = [...anthropicChatModels];

export default allModels;
