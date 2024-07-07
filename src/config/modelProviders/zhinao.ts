import { ModelProviderCard } from '@/types/llm';

// ref https://ai.360.cn/platform/docs/overview
const Zhinao: ModelProviderCard = {
  chatModels: [
    {
      displayName: '360GPT Pro',
      enabled: true,
      functionCall: false,
      id: '360gpt-pro',
      maxOutput: 7000,
      tokens: 8192,
    },
    {
      displayName: '360GPT Turbo',
      enabled: true,
      functionCall: false,
      id: '360gpt-turbo',
      maxOutput: 8192,
      tokens: 8192,
    },
    {
      displayName: '360GPT Turbo Responsibility 8K',
      enabled: true,
      functionCall: false,
      id: '360gpt-turbo-responsibility-8k',
      maxOutput: 2048,
      tokens: 8192,
    },
  ],
  checkModel: '360gpt-turbo',
  id: 'zhinao',
  modelList: { showModelFetcher: true },
  name: 'Zhinao',
};

export default Zhinao;
