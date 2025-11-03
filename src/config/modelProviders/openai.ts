import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.openai.com/docs/deprecations
const OpenAI: ModelProviderCard = {
  apiKeyUrl: 'https://platform.openai.com/api-keys?utm_source=lobehub',
  chatModels: [],
  checkModel: 'gpt-5-nano',
  description:
    'OpenAI 是全球领先的人工智能研究机构，其开发的模型如GPT系列推动了自然语言处理的前沿。OpenAI 致力于通过创新和高效的AI解决方案改变多个行业。他们的产品具有显著的性能和经济性，广泛用于研究、商业和创新应用。',
  enabled: true,
  id: 'openai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.openai.com/docs/models',
  name: 'OpenAI',
  settings: {
    responseAnimation: 'smooth',
    showModelFetcher: true,
    supportResponsesApi: true,
  },
  url: 'https://openai.com',
};

export default OpenAI;
