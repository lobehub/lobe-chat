import { ModelProviderCard } from '@/types/llm';

// ref: https://api.cometapi.com/pricing
const CometAPI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'gpt-5-mini',
  description:
    'CometAPI 是一个提供多种前沿大模型接口的服务平台，支持 OpenAI、Anthropic、Google 及更多，适合多样化的开发和应用需求。用户可根据自身需求灵活选择最优的模型和价格，助力AI体验的提升。',
  enabled: true,
  id: 'cometapi',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://api.cometapi.com/v1/models',
  name: 'CometAPI',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.cometapi.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://cometapi.com',
};

export default CometAPI;
