import { ModelProviderCard } from '@/types/llm';

// ref: https://ollama.com/library
const LMStudio: ModelProviderCard = {
  chatModels: [],
  id: 'lmstudio',
  modelsUrl: 'https://lmstudio.ai/models',
  name: 'LM Studio',
  settings: {
    defaultShowBrowserRequest: true,
    proxyUrl: {
      placeholder: 'http://127.0.0.1:1234/v1',
    },
    showApiKey: false,
    showModelFetcher: true,
    smoothing: {
      speed: 2,
      text: true,
    },
  },
  url: 'https://lmstudio.ai',
};

export default LMStudio;
