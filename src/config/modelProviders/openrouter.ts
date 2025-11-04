import { ModelProviderCard } from '@/types/llm';

// ref :https://openrouter.ai/docs#models
const OpenRouter: ModelProviderCard = {
  chatModels: [],
  checkModel: 'google/gemma-2-9b-it:free',
  description:
    'OpenRouter 是一个提供多种前沿大模型接口的服务平台，支持 OpenAI、Anthropic、LLaMA 及更多，适合多样化的开发和应用需求。用户可根据自身需求灵活选择最优的模型和价格，助力AI体验的提升。',
  id: 'openrouter',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://openrouter.ai/models',
  name: 'OpenRouter',
  settings: {
    // OpenRouter don't support browser request
    // https://github.com/lobehub/lobe-chat/issues/5900
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://openrouter.ai/api/v1',
    },
    sdkType: 'openai',
    searchMode: 'params',
    showModelFetcher: true,
  },
  url: 'https://openrouter.ai',
};

export default OpenRouter;
