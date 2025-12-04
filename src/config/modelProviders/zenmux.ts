import { ModelProviderCard } from '@/types/llm';

const ZenMux: ModelProviderCard = {
  chatModels: [],
  checkModel: 'openai/gpt-5-nano',
  description:
    'ZenMux 是一个统一的 AI 服务聚合平台，支持 OpenAI、Anthropic、Google VertexAI 等多种主流 AI 服务接口。提供灵活的路由能力，让您可以轻松切换和管理不同的 AI 模型。',
  id: 'zenmux',
  name: 'ZenMux',
  settings: {
    disableBrowserRequest: true, // CORS error
    proxyUrl: {
      placeholder: 'https://zenmux.ai',
    },
    sdkType: 'router',
    showModelFetcher: true,
  },
  url: 'https://zenmux.ai',
};

export default ZenMux;
