import { ModelProviderCard } from '@/types/llm';

const Anthropic: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments',
      displayName: 'Claude 3 Sonnet',
      id: 'claude-3-sonnet-20240229',
      maxOutput: 4096,
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Most powerful model for highly complex tasks. Top-level performance, intelligence, fluency, and understanding',
      displayName: 'Claude 3 Opus',
      id: 'claude-3-opus-20240229',
      maxOutput: 4096,
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Fastest and most compact model for near-instant responsiveness. Quick and accurate targeted performance',
      displayName: 'Claude 3 Haiku',
      id: 'claude-3-haiku-20240307',
      maxOutput: 4096,
      tokens: 200_000,
      vision: true,
    },
    {
      displayName: 'Claude 2.1',
      id: 'claude-2.1',
      maxOutput: 4096,
      tokens: 200_000,
    },
    {
      displayName: 'Claude 2.0',
      id: 'claude-2.0',
      maxOutput: 4096,
      tokens: 100_000,
    },
    {
      displayName: 'Claude Instant 1.2',
      hidden: true,
      id: 'claude-instant-1.2',
      maxOutput: 4096,
      tokens: 100_000,
    },
  ],
  id: 'anthropic',
};

export default Anthropic;
