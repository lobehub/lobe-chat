import { AIChatModelCard } from '@/types/aiModel';

const taichuChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: 'Taichu 2.0 基于海量高质数据训练，具有更强的文本理解、内容创作、对话问答等能力',
    displayName: 'Taichu 2.0',
    enabled: true,
    id: 'taichu_llm',
    type: 'chat',
  },
];

export const allModels = [...taichuChatModels];

export default allModels;
