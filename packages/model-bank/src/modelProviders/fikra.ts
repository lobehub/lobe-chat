import type { ModelProviderCard } from '../types';

// ref: https://fikraapi.co.ke/models
const Fikra: ModelProviderCard = {
  chatModels: [],
  checkModel: 'deepseek-v4.1-flash',
  description:
    'Fikra API is an OpenAI-compatible inference service serving open models (DeepSeek, GLM, Kimi, Qwen) with per-token billing and M-Pesa or card payments.',
  id: 'fikra',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://fikraapi.co.ke/models',
  name: 'Fikra',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.fikraapi.co.ke/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://fikraapi.co.ke',
};

export default Fikra;
