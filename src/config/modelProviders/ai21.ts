import { ModelProviderCard } from '@/types/llm';

// ref https://docs.ai21.com/reference/jamba-15-api-ref
const Ai21: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Jamba 1.5 Mini',
      enabled: true,
      functionCall: true,
      id: 'jamba-1.5-mini',
      tokens: 256_000,
    },
    {
      displayName: 'Jamba 1.5 Large',
      enabled: true,
      functionCall: true,
      id: 'jamba-1.5-large',
      tokens: 256_000,
    },
  ],
  checkModel: 'jamba-1.5-mini',
  id: 'ai21',
  modelList: { showModelFetcher: true },
  name: 'Ai21Labs',
};

export default Ai21;
