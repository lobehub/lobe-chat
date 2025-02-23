import { AIChatModelCard } from '@/types/aiModel';

// https://docs.wair.ac.cn/maas/jiage.html

const taichuChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: '基于海量高质数据训练，具有更强的文本理解、内容创作、对话问答等能力',
    displayName: 'Taichu 2.0',
    enabled: true,
    id: 'taichu_llm',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 2,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: '融合了图像理解、知识迁移、逻辑归因等能力，在图文问答领域表现突出',
    displayName: 'Taichu 2.0 VL',
    enabled: true,
    id: 'taichu_vl',
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 5,
    },
    type: 'chat',
  },
];

export const allModels = [...taichuChatModels];

export default allModels;
