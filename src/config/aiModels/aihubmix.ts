import { AIChatModelCard } from '@/types/aiModel';

const aihubmixModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description: 'DeepSeek R1 推理模型，具有强大的推理能力',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'DeepSeek-R1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude Opus 4 是 Anthropic 迄今为止最强大的模型，专为处理复杂、长时间运行的任务而设计。',
    displayName: 'Claude Opus 4',
    enabled: true,
    id: 'claude-opus-4-20250514',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description:
      'Claude Sonnet 4 是一款高效且性价比高的模型，作为 Claude Sonnet 3.7 的升级版，适合日常任务和中等复杂度的应用。',
    displayName: 'Claude Sonnet 4',
    enabled: true,
    id: 'claude-sonnet-4-20250514',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'OpenAI o3 推理模型，具有强大的推理能力',
    displayName: 'o3',
    enabled: true,
    id: 'o3',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    description: 'OpenAI o4-mini 小型推理模型，高效且经济',
    displayName: 'o4-mini',
    enabled: true,
    id: 'o4-mini',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 旗舰模型，适用于复杂任务',
    displayName: 'GPT-4.1',
    enabled: true,
    id: 'gpt-4.1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_047_576,
    description: 'GPT-4.1 mini 平衡智能、速度和成本',
    displayName: 'GPT-4.1 mini',
    enabled: true,
    id: 'gpt-4.1-mini',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_048_576 + 65_536,
    description:
      'Gemini 2.5 Pro 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
    displayName: 'Gemini 2.5 Pro',
    enabled: true,
    id: 'gemini-2.5-pro',
    maxOutput: 65_536,
    pricing: {
      input: 1.25, // prompts <= 200k tokens
      output: 10, // prompts <= 200k tokens
    },
    releasedAt: '2025-06-17',
    settings: {
      extendParams: ['thinkingBudget'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 1_000_000,
    description: 'Gemini 2.5 Flash 预览版，快速高效的多模态模型',
    displayName: 'Gemini 2.5 Flash',
    enabled: true,
    id: 'gemini-2.5-flash',
    releasedAt: '2025-06-17',
    settings: {
      extendParams: ['thinkingBudget'],
      searchImpl: 'params',
      searchProvider: 'google',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 235_000,
    description: 'Qwen3 235B 大型语言模型',
    displayName: 'Qwen3 235B',
    enabled: true,
    id: 'Qwen/Qwen3-235B-A22B',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_000,
    description: 'Qwen3 32B 中型语言模型',
    displayName: 'Qwen3 32B',
    enabled: true,
    id: 'Qwen/Qwen3-32B',
    type: 'chat',
  },
];

export default aihubmixModels;
