import { ModelProviderCard } from '@/types/llm';

const Search1API: ModelProviderCard = {
  chatModels: [],
  checkModel: 'deepseek-r1-70b-fast-online',
  description:
    'Search1API 提供可根据需要自行联网的 DeepSeek 系列模型的访问，包括标准版和快速版本，支持多种参数规模的模型选择。',
  id: 'search1api',
  modelList: { showModelFetcher: true },
  name: 'Search1API',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.search1api.com/v1',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://www.search1api.com',
};

export default Search1API;
