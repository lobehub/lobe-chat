import { AIChatModelCard } from '@/types/aiModel';

const azureChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    displayName: 'DeepSeek R1',
    id: 'DeepSeek-R1',
    maxOutput: 4096,
    type: 'chat',
  },
];

export const allModels = [...azureChatModels];

export default allModels;
