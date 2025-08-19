import { ModelProviderCard } from '@/types/llm';

const AiHubMix: ModelProviderCard = {
  apiKeyUrl: 'https://lobe.li/9mZhb4T',
  chatModels: [],
  checkModel: 'gpt-4.1-nano',
  description: 'AiHubMix 通过统一的 API 接口提供对多种 AI 模型的访问。',
  id: 'aihubmix',
  modelsUrl: 'https://docs.aihubmix.com/cn/api/Model-List',
  name: 'AiHubMix',
  settings: {
    sdkType: 'router',
    showModelFetcher: true,
  },
  url: 'https://aihubmix.com?utm_source=lobehub',
};

export default AiHubMix;
