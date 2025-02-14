import { AIChatModelCard } from '@/types/aiModel';

const vllmChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true
    },
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1 是 Meta 推出的领先模型，支持高达 405B 参数，可应用于复杂对话、多语言翻译和数据分析领域。',
    displayName: 'Meta Llama 3.1 70B',
    enabled: true,
    id: 'meta-llama/Meta-Llama-3.1-70B',
    type: 'chat',
  },
]

export const allModels = [...vllmChatModels];

export default allModels;
