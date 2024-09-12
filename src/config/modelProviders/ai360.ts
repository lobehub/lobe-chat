import { ModelProviderCard } from '@/types/llm';

const Ai360: ModelProviderCard = {
  chatModels: [
    {
      displayName: '360GPT2 Pro',
      enabled: true,
      functionCall: false,
      id: '360gpt2-pro',
      maxOutput: 7000,
      pricing: {
        currency: 'CNY',
        input: 5,
        output: 5,
      },
      tokens: 8192,
    },
    {
      displayName: '360GPT Pro',
      id: '360gpt-pro',
      maxOutput: 7000,
      pricing: {
        currency: 'CNY',
        input: 5,
        output: 5,
      },
      tokens: 8192,
    },
    {
      displayName: '360GPT Turbo',
      enabled: true,
      id: '360gpt-turbo',
      maxOutput: 7000,
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 2,
      },
      tokens: 8192,
    },
    {
      displayName: '360GPT Turbo Responsibility 8K',
      enabled: true,
      id: '360gpt-turbo-responsibility-8k',
      maxOutput: 2048,
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 2,
      },
      tokens: 8192,
    },
  ],
  checkModel: '360gpt-turbo',
  disableBrowserRequest: true,
  id: 'ai360',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ai.360.cn/platform/docs/overview',
  name: '360 AI',
  url: 'https://ai.360.com',
};

export default Ai360;
