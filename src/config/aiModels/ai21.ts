import { AIChatModelCard } from '@/types/aiModel';

const ai21ChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 256_000,
    displayName: 'Jamba 1.5 Mini',
    enabled: true,
    id: 'jamba-1.5-mini',
    pricing: {
      input: 0.2,
      output: 0.4,
    },
    releasedAt: '2024-08-22',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 256_000,
    displayName: 'Jamba 1.5 Large',
    enabled: true,
    id: 'jamba-1.5-large',
    pricing: {
      input: 2,
      output: 8,
    },
    releasedAt: '2024-08-22',
    type: 'chat',
  },
];

export const allModels = [...ai21ChatModels];

export default allModels;
