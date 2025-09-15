import { AIChatModelCard } from '../types/aiModel';

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
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
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
    id: '360gpt2-o1',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 8000,
    description: '360智脑系列效果最好的主力千亿级大模型，广泛适用于各领域复杂任务场景。',
    displayName: '360GPT2 Pro',
    enabled: true,
    id: '360gpt2-pro',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
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
    description: '360智脑系列效果最好的主力千亿级大模型，广泛适用于各领域复杂任务场景。',
    displayName: '360GPT Pro',
    id: '360gpt-pro',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_000,
    description: '翻译专用模型，深度微调优化，翻译效果领先。',
    displayName: '360GPT Pro Trans',
    id: '360gpt-pro-trans',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 7000,
    description: '兼顾性能和效果的百亿级大模型，适合对性能/成本要求较高 的场景。',
    displayName: '360GPT Turbo',
    enabled: true,
    id: '360gpt-turbo',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 64_000,
    description:
      '【360部署版】DeepSeek-R1在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。在数学、代码、自然语言推理等任务上，性能比肩 OpenAI o1 正式版。',
    displayName: 'DeepSeek R1',
    id: '360/deepseek-r1',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...ai360ChatModels];

export default allModels;
