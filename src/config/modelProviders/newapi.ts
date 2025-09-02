import { ModelProviderCard } from '@/types/llm';

const NewAPI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'gpt-4o-mini',
  description: 'New API 大多数国内第三方中转商使用的，聚合多个 AI 服务统一转发的平台',
  enabled: true,
  id: 'newapi',
  name: 'New API',
  settings: {
    sdkType: 'router',
    showModelFetcher: true,
  },
  url: 'https://github.com/Calcium-Ion/new-api',
};

export default NewAPI;
