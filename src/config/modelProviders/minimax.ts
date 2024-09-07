import { ModelProviderCard } from '@/types/llm';

// ref https://www.minimaxi.com/document/guides/chat-model/pro/api
const Minimax: ModelProviderCard = {
  chatModels: [
    {
      description: '通用场景',
      displayName: 'abab6.5s',
      enabled: true,
      functionCall: true,
      id: 'abab6.5s-chat',
      tokens: 245_760,
    },
    {
      description: '英文等多语种人设对话场景',
      displayName: 'abab6.5g',
      enabled: true,
      functionCall: true,
      id: 'abab6.5g-chat',
      tokens: 8192,
    },
    {
      description: '中文人设对话场景',
      displayName: 'abab6.5t',
      enabled: true,
      functionCall: true,
      id: 'abab6.5t-chat',
      tokens: 8192,
    },
    {
      description: '生产力场景',
      displayName: 'abab5.5',
      enabled: true,
      id: 'abab5.5-chat',
      tokens: 16_384,
    },
    {
      description: '中文人设对话场景',
      displayName: 'abab5.5s',
      enabled: true,
      id: 'abab5.5s-chat',
      tokens: 8192,
    },
  ],
  checkModel: 'abab6.5s-chat',
  id: 'minimax',
  name: 'Minimax',
};

export default Minimax;
