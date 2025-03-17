import { AIChatModelCard } from '@/types/aiModel';

const cohereChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_000,
    description: '',
    displayName: 'Command',
    enabled: true,
    id: 'command',
    pricing: {
      input: 0.6,
      output: 1.2
    },
    type: 'chat'
  },
]

export const allModels = [...cohereChatModels];

export default allModels;
