import { ModelProviderCard } from '@/types/llm';

// ref https://platform.deepseek.com/api-docs/pricing
const DeepSeek: ModelProviderCard = {
  chatModels: [
    {
      description: '擅长通用对话任务',
      displayName: 'DeepSeek V2.5',
      enabled: true,
      functionCall: true,
      id: 'deepseek-chat',
      tokens: 128_000,
    },
  ],
  checkModel: 'deepseek-chat',
  id: 'deepseek',
  modelList: { showModelFetcher: true },
  name: 'DeepSeek',
};

export default DeepSeek;
