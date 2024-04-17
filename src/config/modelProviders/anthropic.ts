import { ModelProviderCard } from '@/types/llm';

// ref https://docs.anthropic.com/claude/docs/models-overview
const Anthropic: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments',
      displayName: 'Claude 3 Sonnet',
      enabled: true,
      id: 'claude-3-sonnet-20240229',
      maxOutput: 4096,
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Most powerful model for highly complex tasks. Top-level performance, intelligence, fluency, and understanding',
      displayName: 'Claude 3 Opus',
      enabled: true,
      id: 'claude-3-opus-20240229',
      maxOutput: 4096,
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Fastest and most compact model for near-instant responsiveness. Quick and accurate targeted performance',
      displayName: 'Claude 3 Haiku',
      enabled: true,
      id: 'claude-3-haiku-20240307',
      maxOutput: 4096,
      tokens: 200_000,
      vision: true,
    },
    {
      displayName: 'Claude 2.1',
      enabled: false,
      id: 'claude-2.1',
      maxOutput: 4096,
      tokens: 200_000,
    },
    {
      displayName: 'Claude 2.0',
      enabled: false,
      id: 'claude-2.0',
      maxOutput: 4096,
      tokens: 100_000,
    },
    {
      displayName: 'Claude Instant 1.2',
      enabled: false,
      id: 'claude-instant-1.2',
      maxOutput: 4096,
      tokens: 100_000,
    },
  ],
  id: 'anthropic',
};

export default Anthropic;
