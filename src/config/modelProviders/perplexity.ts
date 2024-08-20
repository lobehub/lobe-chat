import { ModelProviderCard } from '@/types/llm';

// ref https://docs.perplexity.ai/docs/model-cards
const Perplexity: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Llama3.1 Sonar Small Chat',
      enabled: true,
      id: 'llama-3.1-sonar-small-128k-chat',
      tokens: 128_000,
    },
    {
      displayName: 'Llama3.1 Sonar Large Chat',
      enabled: true,
      id: 'llama-3.1-sonar-large-128k-chat',
      tokens: 128_000,
    },
    {
      displayName: 'Llama3.1 Sonar Small Online',
      enabled: true,
      id: 'llama-3.1-sonar-small-128k-online',
      tokens: 128_000,
    },
    {
      displayName: 'Llama3.1 Sonar Large Online',
      enabled: true,
      id: 'llama-3.1-sonar-large-128k-online',
      tokens: 128_000,
    },
    {
      displayName: 'Llama3.1 8B Instruct',
      id: 'llama-3.1-8b-instruct',
      tokens: 128_000,
    },
    {
      displayName: 'Llama3.1 70B Instruct',
      id: 'llama-3.1-70b-instruct',
      tokens: 128_000,
    },
  ],
  checkModel: 'llama-3.1-8b-instruct',
  id: 'perplexity',
  name: 'Perplexity',
  proxyUrl: {
    placeholder: 'https://api.perplexity.ai',
  },
};

export default Perplexity;
