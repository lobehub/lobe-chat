import { ModelProviderCard } from '@/types/llm';

// ref: https://302.ai/pricing/
const Ai302: ModelProviderCard = {
  apiKeyUrl: 'https://lobe.li/Oizw5sN',
  chatModels: [],
  checkModel: 'gpt-4o',
  description: '302.AI 是一个按需付费的 AI 应用平台，提供市面上最全的 AI API 和 AI 在线应用',
  id: 'ai302',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://302.ai/pricing/',
  name: '302.AI',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.302.ai/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://302.ai',
};

export default Ai302;
