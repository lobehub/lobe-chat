import { ModelProviderCard } from '@/types/llm';

// ref :https://docs.perplexity.ai/docs/model-cards
const Perplexity: ModelProviderCard = {
  chatModels: [],
  checkModel: 'sonar',
  description:
    'Perplexity 是一家领先的对话生成模型提供商，提供多种先进的Llama 3.1模型，支持在线和离线应用，特别适用于复杂的自然语言处理任务。',
  id: 'perplexity',
  modelsUrl: 'https://docs.perplexity.ai/guides/model-cards',
  name: 'Perplexity',
  settings: {
    // perplexity doesn't support CORS
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.perplexity.ai',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    sdkType: 'openai',
  },
  url: 'https://www.perplexity.ai',
};

export default Perplexity;
