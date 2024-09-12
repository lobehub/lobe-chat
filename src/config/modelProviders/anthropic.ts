import { ModelProviderCard } from '@/types/llm';

// ref: https://docs.anthropic.com/en/docs/about-claude/models#model-names
const Anthropic: ModelProviderCard = {
  chatModels: [
    {
      description:
        'Claude 3.5 Sonnet 提供了超越 Opus 的能力和比 Sonnet 更快的速度，同时保持与 Sonnet 相同的价格。Sonnet 特别擅长编程、数据科学、视觉处理、代理任务。',
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
        'Claude 3 Haiku 是 Anthropic 的最快且最紧凑的模型，旨在实现近乎即时的响应。它具有快速且准确的定向性能。',
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
      description:
        'Claude 3 Sonnet 在智能和速度方面为企业工作负载提供了理想的平衡。它以更低的价格提供最大效用，可靠且适合大规模部署。',
      displayName: 'Claude 3 Sonnet',
      enabled: true,
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
        'Claude 3 Opus 是 Anthropic 用于处理高度复杂任务的最强大模型。它在性能、智能、流畅性和理解力方面表现卓越。',
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
        'Claude 2 为企业提供了关键能力的进步，包括业界领先的 200K token 上下文、大幅降低模型幻觉的发生率、系统提示以及一个新的测试功能：工具调用。',
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
      description:
        'Claude 2 为企业提供了关键能力的进步，包括业界领先的 200K token 上下文、大幅降低模型幻觉的发生率、系统提示以及一个新的测试功能：工具调用。',
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
      description: 'Anthropic 的模型用于低延迟、高吞吐量的文本生成，支持生成数百页的文本。',
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
  description:
    'Anthropic 是一家专注于人工智能研究和开发的公司，提供了一系列先进的语言模型，如 Claude 3.5 Sonnet、Claude 3 Sonnet、Claude 3 Opus 和 Claude 3 Haiku。这些模型在智能、速度和成本之间取得了理想的平衡，适用于从企业级工作负载到快速响应的各种应用场景。Claude 3.5 Sonnet 作为其最新模型，在多项评估中表现优异，同时保持了较高的性价比。',
  id: 'anthropic',
  modelsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models#model-names',
  name: 'Anthropic',
  proxyUrl: {
    placeholder: 'https://api.anthropic.com',
  },
  url: 'https://anthropic.com',
};

export default Anthropic;
