import { ModelProviderCard } from '@/types/llm';

const Mistral: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Mistral 7B',
      id: 'open-mistral-7b',
      tokens: 32_768,
    },
    {
      displayName: 'Mixtral 8x7B',
      id: 'open-mixtral-8x7b',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral Small (2402)',
      id: 'mistral-small-2402',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral Medium (2312)',
      id: 'mistral-medium-2312',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral Large (2402)',
      id: 'mistral-large-2402',
      tokens: 32_768,
    },
  ],
  id: 'mistral',
};

export default Mistral;
