import { ModelProviderCard } from '@/types/llm';

// ref https://docs.mistral.ai/getting-started/models/
const Mistral: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Mistral 7B',
      enabled: true,
      id: 'open-mistral-7b',
      tokens: 32_768,
    },
    {
      displayName: 'Mixtral 8x7B',
      enabled: true,
      id: 'open-mixtral-8x7b',
      tokens: 32_768,
    },
    {
      displayName: 'Mixtral 8x22B',
      enabled: true,
      functionCall: true,
      id: 'open-mixtral-8x22b',
      tokens: 65_536,
    },
    {
      displayName: 'Mistral Small',
      enabled: true,
      id: 'mistral-small-latest',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral Medium',
      enabled: true,
      id: 'mistral-medium-latest',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral Large',
      enabled: true,
      id: 'mistral-large-latest',
      tokens: 32_768,
    },
  ],
  id: 'mistral',
};

export default Mistral;
