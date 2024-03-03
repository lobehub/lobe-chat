import { ModelProviderCard } from '@/types/llm';

const Anthropic: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Claude Instant 1.2',
      id: 'claude-instant-1.2',
      tokens: 100_000,
    },
    {
      displayName: 'Claude 2.0',
      id: 'claude-2.0',
      tokens: 100_000,
    },
    {
      displayName: 'Claude 2.1',
      id: 'claude-2.1',
      tokens: 200_000,
    },
  ],
  id: 'anthropic',
};

export default Anthropic;
