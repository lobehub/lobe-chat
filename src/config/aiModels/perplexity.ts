import { AIChatModelCard } from '@/types/aiModel';

const perplexityChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 127_072,
    description:
      'Deep Research 进行全面的专家级研究，并将其综合成可访问、可作的报告。',
    displayName: 'Sonar Deep Research',
    enabled: true,
    id: 'sonar-deep-research',
    maxOutput: 8192,
    pricing: { input: 2, output: 8 },
    releasedAt: '2025-02-14',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 127_072,
    description: '支持搜索上下文的高级搜索产品，支持高级查询和跟进。',
    displayName: 'Sonar Reasoning Pro',
    enabled: true,
    id: 'sonar-reasoning-pro',
    maxOutput: 8192,
    pricing: { input: 2, output: 8 },
    releasedAt: '2025-01-21',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 127_072,
    description: '支持搜索上下文的高级搜索产品，支持高级查询和跟进。',
    displayName: 'Sonar Reasoning',
    enabled: true,
    id: 'sonar-reasoning',
    maxOutput: 8192,
    pricing: { input: 1, output: 5 },
    releasedAt: '2025-01-21',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 200_000,
    description: '支持搜索上下文的高级搜索产品，支持高级查询和跟进。',
    displayName: 'Sonar Pro',
    enabled: true,
    id: 'sonar-pro',
    pricing: { input: 3, output: 15 },
    releasedAt: '2025-01-21',
    settings: {
      searchImpl: 'internal',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 127_072,
    description: '基于搜索上下文的轻量级搜索产品，比 Sonar Pro 更快、更便宜。',
    displayName: 'Sonar',
    enabled: true,
    id: 'sonar',
    pricing: { input: 1, output: 1 },
    releasedAt: '2025-01-21',
    settings: {
      searchImpl: 'internal',
    },

    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 127_072,
    description:
      'R1-1776 是 DeepSeek R1 模型的一个版本，经过后训练，可提供未经审查、无偏见的事实信息。',
    displayName: 'R1 1776',
    id: 'r1-1776',
    pricing: { input: 2, output: 8 },
    releasedAt: '2025-02-18',
    type: 'chat',
  },
];

export const allModels = [...perplexityChatModels];

export default allModels;
