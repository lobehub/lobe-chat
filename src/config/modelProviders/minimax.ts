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
      description: '复杂场景，例如应用题计算、科学计算等场景',
      displayName: 'abab6.5',
      enabled: true,
      functionCall: true,
      id: 'abab6.5-chat',
      tokens: 8192,
    },
    {
      description: '更复杂的格式化文本生成',
      displayName: 'abab6',
      enabled: true,
      functionCall: true,
      id: 'abab6-chat',
      tokens: 32_768,
    },
    {
      description: '生产力场景',
      displayName: 'abab5.5',
      enabled: true,
      id: 'abab5.5-chat',
      tokens: 16_384,
    },
    {
      description: '人设对话场景',
      displayName: 'abab5.5s',
      enabled: true,
      id: 'abab5.5s-chat',
      tokens: 8192,
    },
  ],
  checkModel: 'abab5.5s-chat',
  id: 'minimax',
  name: 'Minimax',
};

export default Minimax;
