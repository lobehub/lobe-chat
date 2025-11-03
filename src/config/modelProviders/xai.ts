import { ModelProviderCard } from '@/types/llm';

// ref: https://x.ai/about
const XAI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'grok-2-1212',
  description:
    'xAI 是一家致力于构建人工智能以加速人类科学发现的公司。我们的使命是推动我们对宇宙的共同理解。',
  id: 'xai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.x.ai/docs#models',
  name: 'xAI (Grok)',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.x.ai/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://x.ai/api',
};

export default XAI;
