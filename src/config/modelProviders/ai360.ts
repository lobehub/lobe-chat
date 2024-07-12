import { ModelProviderCard } from '@/types/llm';

// ref https://ai.360.cn/platform/docs/overview
const Ai360: ModelProviderCard = {
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
  disableBrowserRequest: true,
  id: 'ai360',
  modelList: { showModelFetcher: true },
  name: '360智脑',
};

export default Ai360;
