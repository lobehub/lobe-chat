import { ModelProviderCard } from '@/types/llm';

const Perplexity: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Perplexity 7B Chat',
      id: 'pplx-7b-chat',
      tokens: 8192,
    },
    {
      displayName: 'Perplexity 70B Chat',
      id: 'pplx-70b-chat',
      tokens: 8192,
    },
    {
      displayName: 'Perplexity 7B Online',
      id: 'pplx-7b-online',
      tokens: 8192,
    },
    {
      displayName: 'Perplexity 70B Online',
      id: 'pplx-70b-online',
      tokens: 8192,
    },
    {
      displayName: 'Codellama 34B Instruct',
      id: 'codellama-34b-instruct',
      tokens: 16_384,
    },
    {
      displayName: 'Codellama 70B Instruct',
      id: 'codellama-70b-instruct',
      tokens: 16_384,
    },
    {
      displayName: 'Mixtral 8x7B Instruct',
      id: 'mixtral-8x7b-instruct',
      tokens: 8192,
    },
  ],
  id: 'perplexity',
};

export default Perplexity;
