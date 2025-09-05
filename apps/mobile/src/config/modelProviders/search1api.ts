import { ModelProviderCard } from '@/types/llm';

const Search1API: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 65_536,
      description:
        'DeepSeek R1 70B 标准版，支持实时联网搜索，适合需要最新信息的对话和文本处理任务。',
      displayName: 'DeepSeek R1 70B',
      enabled: true,
      id: 'deepseek-r1-70b-online',
    },
    {
      contextWindowTokens: 65_536,
      description:
        'DeepSeek R1 满血版，拥有 671B 参数，支持实时联网搜索，具有更强大的理解和生成能力。',
      displayName: 'DeepSeek R1',
      enabled: true,
      id: 'deepseek-r1-online',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek R1 70B 快速版，支持实时联网搜索，在保持模型性能的同时提供更快的响应速度。',
      displayName: 'DeepSeek R1 70B Fast',
      enabled: true,
      id: 'deepseek-r1-70b-fast-online',
    },
    {
      contextWindowTokens: 163_840,
      description:
        'DeepSeek R1 满血快速版，支持实时联网搜索，结合了 671B 参数的强大能力和更快的响应速度。',
      displayName: 'DeepSeek R1 Fast',
      enabled: false,
      id: 'deepseek-r1-fast-online',
    },
  ],
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
