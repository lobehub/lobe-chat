import { ModelProviderCard } from '@/types/llm';

const Jina: ModelProviderCard = {
  chatModels: [],
  checkModel: 'jina-deepsearch-v1',
  description: 'Jina AI 成立于 2020 年，是一家领先的搜索 AI 公司。我们的搜索底座平台包含了向量模型、重排器和小语言模型，可帮助企业构建可靠且高质量的生成式AI和多模态的搜索应用。',
  id: 'jina',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://jina.ai/models',
  name: 'Jina AI',
  settings: {
    proxyUrl: {
      placeholder: 'https://deepsearch.jina.ai/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://jina.ai',
};

export default Jina; 
