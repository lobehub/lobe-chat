import { ModelProviderCard } from '@/types/llm';

const Cohere: ModelProviderCard = {
  chatModels: [],
  checkModel: 'command-r7b-12-2024',
  description:
    'Cohere 为您带来最前沿的多语言模型、先进的检索功能以及为现代企业量身定制的 AI 工作空间 — 一切都集成在一个安全的平台中。',
  id: 'cohere',
  modelsUrl: 'https://docs.cohere.com/v2/docs/models',
  name: 'Cohere',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.cohere.ai/compatibility/v1',
    },
    sdkType: 'openai',
  },
  url: 'https://cohere.com',
};

export default Cohere;
