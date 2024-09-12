import { ModelProviderCard } from '@/types/llm';

const Anthropic: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Claude 3.5 Sonnet raises the industry bar for intelligence, outperforming competitor models and Claude 3 Opus on a wide range of evaluations, with the speed and cost of our mid-tier model, Claude 3 Sonnet.',
      displayName: 'Claude 3.5 Sonnet',
      enabled: true,
      functionCall: true,
      id: 'claude-3-5-sonnet-20240620',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.3,
        input: 3,
        output: 15,
        writeCacheInput: 3.75,
      },
      releasedAt: '2024-06-20',
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Ideal balance of intelligence and speed for enterprise workloads. Maximum utility at a lower price, dependable, balanced for scaled deployments',
      displayName: 'Claude 3 Sonnet',
      functionCall: true,
      id: 'claude-3-sonnet-20240229',
      maxOutput: 4096,
      pricing: {
        input: 3,
        output: 15,
      },
      releasedAt: '2024-02-29',
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Most powerful model for highly complex tasks. Top-level performance, intelligence, fluency, and understanding',
      displayName: 'Claude 3 Opus',
      enabled: true,
      functionCall: true,
      id: 'claude-3-opus-20240229',
      maxOutput: 4096,
      pricing: {
        input: 15,
        output: 75,
      },
      releasedAt: '2024-02-29',
      tokens: 200_000,
      vision: true,
    },
    {
      description:
        'Fastest and most compact model for near-instant responsiveness. Quick and accurate targeted performance',
      displayName: 'Claude 3 Haiku',
      enabled: true,
      functionCall: true,
      id: 'claude-3-haiku-20240307',
      maxOutput: 4096,
      pricing: {
        input: 0.25,
        output: 1.25,
      },
      releasedAt: '2024-03-07',
      tokens: 200_000,
      vision: true,
    },
    {
      displayName: 'Claude 2.1',
      id: 'claude-2.1',
      maxOutput: 4096,
      pricing: {
        input: 8,
        output: 24,
      },
      releasedAt: '2023-11-21',
      tokens: 200_000,
    },
    {
      displayName: 'Claude 2.0',
      id: 'claude-2.0',
      maxOutput: 4096,
      pricing: {
        input: 8,
        output: 24,
      },
      releasedAt: '2023-07-11',
      tokens: 100_000,
    },
    {
      displayName: 'Claude Instant 1.2',
      id: 'claude-instant-1.2',
      maxOutput: 4096,
      pricing: {
        input: 0.8,
        output: 2.4,
      },
      releasedAt: '2023-08-09',
      tokens: 100_000,
    },
  ],
  checkModel: 'claude-3-haiku-20240307',
  id: 'anthropic',
  modelsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models#model-names',
  name: 'Anthropic',
  proxyUrl: {
    placeholder: 'https://api.anthropic.com',
  },
  url: 'https://anthropic.com',
};

export default Anthropic;
