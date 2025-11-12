import { AIChatModelCard } from '../types/aiModel';

const ai360ChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 8000,
    description:
      '360zhinao2-o1 uses tree search to construct chain-of-thought reasoning and incorporates a reflection mechanism. Trained with reinforcement learning, the model has self-reflection and error-correction capabilities.',
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
      '360gpt2-o1 uses tree search to construct chain-of-thought reasoning and incorporates a reflection mechanism. Trained with reinforcement learning, the model has self-reflection and error-correction capabilities.',
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
    description: '360Zhinao series best-performing flagship model with hundreds of billions of parameters, widely applicable to complex task scenarios across various domains.',
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
    description: '360Zhinao series best-performing flagship model with hundreds of billions of parameters, widely applicable to complex task scenarios across various domains.',
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
    description: 'Translation-specific model with deep fine-tuning optimization, delivering leading translation performance.',
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
    description: 'Tens-of-billions parameter model balancing performance and effectiveness, suitable for scenarios with high performance/cost requirements.',
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
      '[360 Deployment] DeepSeek-R1 extensively uses reinforcement learning techniques during post-training. With minimal annotated data, it significantly improves model reasoning capabilities. Performance on math, coding, and natural language reasoning tasks rivals OpenAI o1 official version.',
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
