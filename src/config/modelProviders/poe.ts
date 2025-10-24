import { ModelProviderCard } from '@/types/llm';

// ref: https://poe.com/
const Poe: ModelProviderCard = {
  chatModels: [],
  description:
    'Poe by Quora provides access to multiple AI models including Claude, GPT-4, and Gemini through a unified API. Poe offers a convenient way to access various leading AI models with consistent API interface.',
  enabled: true,
  id: 'poe',
  modelList: { showModelFetcher: true },
  name: 'Poe',
  proxyUrl: {
    placeholder: 'https://api.poe.com',
  },
  settings: {
    proxyUrl: {
      placeholder: 'https://api.poe.com',
    },
    showModelFetcher: true,
  },
  url: 'https://poe.com',
};

export default Poe;
