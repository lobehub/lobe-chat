import { AIChatModelCard } from '@/types/aiModel';

const ai360ChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 8000,
    description:
      '360zhinao2-o1 使用树搜索构建思维链，并引入了反思机制，使用强化学习训练，模型具备自我反思与纠错的能力。',
    displayName: '360Zhinao2 o1',
    enabled: true,
    id: '360zhinao2-o1',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 10,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 8000,
    description:
      '360gpt2-o1 使用树搜索构建思维链，并引入了反思机制，使用强化学习训练，模型具备自我反思与纠错的能力。',
    displayName: '360GPT2 o1',
    enabled: true,
    id: '360gpt2-o1',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 10,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8000,
    description:
      '360智脑系列效果最好的主力千亿级大模型，广泛适用于各领域复杂任务场景。',
    displayName: '360GPT2 Pro',
    enabled: true,
    id: '360gpt2-pro',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 5,
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
      '360智脑系列效果最好的主力千亿级大模型，广泛适用于各领域复杂任务场景。',
    displayName: '360GPT Pro',
    enabled: true,
    id: '360gpt-pro',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 5,
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 7000,
    description:
      '兼顾性能和效果的百亿级大模型，适合对性能/成本要求较高 的场景。',
    displayName: '360GPT Turbo',
    enabled: true,
    id: '360gpt-turbo',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 2,
    },
    type: 'chat',
  },
];

export const allModels = [...ai360ChatModels];

export default allModels;
