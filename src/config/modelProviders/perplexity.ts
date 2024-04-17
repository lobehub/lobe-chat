import { ModelProviderCard } from '@/types/llm';

// ref https://docs.perplexity.ai/docs/model-cards
const Perplexity: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Perplexity 7B Chat',
      id: 'sonar-small-chat',
      tokens: 16_384,
    },
    {
      displayName: 'Perplexity 8x7B Chat',
      enabled: true,
      id: 'sonar-medium-chat',
      tokens: 16_384,
    },
    {
      displayName: 'Perplexity 7B Online',
      id: 'sonar-small-online',
      tokens: 12_000,
    },
    {
      displayName: 'Perplexity 8x7B Online',
      enabled: true,
      id: 'sonar-medium-online',
      tokens: 12_000,
    },
    {
      displayName: 'Codellama 70B Instruct',
      id: 'codellama-70b-instruct',
      tokens: 16_384,
    },
    {
      displayName: 'Mistral 7B Instruct',
      id: 'mistral-7b-instruc',
      tokens: 16_384,
    },
    {
      displayName: 'Mixtral 8x7B Instruct',
      id: 'mixtral-8x7b-instruct',
      tokens: 16_384,
    },
  ],
  id: 'perplexity',
};

export default Perplexity;
