import { ModelProviderCard } from '@/types/llm';

const NewAPI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'gpt-4o-mini',
  description: '开源的多个 AI 服务聚合统一转发平台',
  enabled: true,
  id: 'newapi',
  name: 'New API',
  settings: {
    proxyUrl: {
      placeholder: 'https://your.new-api-provider.com',
    },
    sdkType: 'router',
    showModelFetcher: true,
  },
  url: 'https://github.com/Calcium-Ion/new-api',
};

export default NewAPI;
