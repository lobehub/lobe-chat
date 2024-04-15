import { ModelProviderCard } from '@/types/llm';

const Minimax: ModelProviderCard = {
  chatModels: [
    {
      description: '更复杂的格式化文本生成',
      displayName: 'abab6',
      id: 'abab6-chat',
      tokens: 32_768,
    },
    {
      description: '生产力场景',
      displayName: 'abab5.5',
      id: 'abab5.5-chat',
      tokens: 16_384,
    },
    {
      description: '人设对话场景',
      displayName: 'abab5.5s',
      id: 'abab5.5s-chat',
      tokens: 8192,
    },
  ],
  id: 'minimax',
};

export default Minimax;
