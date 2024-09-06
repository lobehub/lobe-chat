import { ModelProviderCard } from '@/types/llm';

// ref https://docs.mistral.ai/getting-started/models/
// ref https://docs.mistral.ai/capabilities/function_calling/
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
      displayName: 'Mistral Nemo',
      enabled: true,
      functionCall: true,
      id: 'open-mistral-nemo',
      tokens: 128_000,
    },
    {
      displayName: 'Mistral Large',
      enabled: true,
      functionCall: true,
      id: 'mistral-large-latest',
      tokens: 128_000,
    },
    {
      displayName: 'Codestral',
      enabled: true,
      id: 'codestral-latest',
      tokens: 32_768,
    },
    {
      displayName: 'Codestral Mamba',
      enabled: true,
      id: 'open-codestral-mamba',
      tokens: 256_000,
    },
  ],
  checkModel: 'open-mistral-7b',
  id: 'mistral',
  name: 'Mistral',
};

export default Mistral;
