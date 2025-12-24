import { ModelProviderCard } from '@/types/llm';

// AI Badgr - Budget/Utility OpenAI-compatible provider
const AIBadgr: ModelProviderCard = {
  chatModels: [],
  checkModel: 'premium',
  description:
    'AI Badgr 是一个预算友好的 OpenAI 兼容模型提供商，提供 basic、normal 和 premium 三档模型，适合追求性价比的开发者使用。',
  id: 'aibadgr',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://aibadgr.com',
  name: 'AI Badgr',
  settings: {
    proxyUrl: {
      placeholder: 'https://aibadgr.com/api/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://aibadgr.com',
};

export default AIBadgr;
