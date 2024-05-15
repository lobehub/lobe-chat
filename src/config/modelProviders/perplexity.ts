import { ModelProviderCard } from '@/types/llm';

// ref https://docs.perplexity.ai/docs/model-cards
const Perplexity: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Perplexity 7B Chat',
      id: 'llama-3-sonar-small-32k-chat',
      tokens: 32_768,
    },
    {
      displayName: 'Perplexity 70B Chat',
      enabled: true,
      id: 'llama-3-sonar-large-32k-chat',
      tokens: 32_768,
    },
    {
      displayName: 'Perplexity 7B Online',
      id: 'llama-3-sonar-small-32k-online',
      tokens: 28_000,
    },
    {
      displayName: 'Perplexity 70B Online',
      enabled: true,
      id: 'llama-3-sonar-large-32k-online',
      tokens: 28_000,
    },
    {
      displayName: 'Llama3 8B Instruct',
      id: 'llama-3-8b-instruct',
      tokens: 8192,
    },
    {
      displayName: 'Llama3 70B Instruct',
      id: 'llama-3-70b-instruct',
      tokens: 8192,
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
