import { AIChatModelCard } from '@/types/aiModel';

const ai21ChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 256_000,
    description: '在同级别中最高效的模型，兼顾速度与质量，具备更小的体积。',
    displayName: 'Jamba Mini',
    enabled: true,
    id: 'jamba-mini',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-03-06',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 256_000,
    description: '我们最强大、最先进的模型，专为处理企业级复杂任务而设计，具备卓越的性能。',
    displayName: 'Jamba Large',
    enabled: true,
    id: 'jamba-large',
    pricing: {
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-03-06',
    type: 'chat',
  },
];

export const allModels = [...ai21ChatModels];

export default allModels;
