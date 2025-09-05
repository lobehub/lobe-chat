import { ModelProviderCard } from '@/types/llm';

// ref: https://ollama.com/library
const LMStudio: ModelProviderCard = {
  chatModels: [],
  description: 'LM Studio 是一个用于在您的计算机上开发和实验 LLMs 的桌面应用程序。',
  id: 'lmstudio',
  modelsUrl: 'https://lmstudio.ai/models',
  name: 'LM Studio',
  settings: {
    defaultShowBrowserRequest: true,
    proxyUrl: {
      placeholder: 'http://127.0.0.1:1234/v1',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    showApiKey: false,
    showModelFetcher: true,
  },
  url: 'https://lmstudio.ai',
};

export default LMStudio;
