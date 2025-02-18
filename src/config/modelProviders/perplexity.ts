import { ModelProviderCard } from '@/types/llm';

// ref :https://docs.perplexity.ai/docs/model-cards
const Perplexity: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 127_072,
      description:
        '由 DeepSeek 推理模型提供支持的新 API 产品。',
      displayName: 'Sonar Reasoning',
      enabled: true,
      id: 'sonar-reasoning',
    },
    {
      contextWindowTokens: 200_000,
      description:
        '支持搜索上下文的高级搜索产品，支持高级查询和跟进。',
      displayName: 'Sonar Pro',
      enabled: true,
      id: 'sonar-pro',
    },
    {
      contextWindowTokens: 127_072,
      description:
        '基于搜索上下文的轻量级搜索产品，比 Sonar Pro 更快、更便宜。',
      displayName: 'Sonar',
      enabled: true,
      id: 'sonar',
    },
    // The following will be deprecated on 02-22
    {
      contextWindowTokens: 127_072,
      description:
        'Llama 3.1 Sonar Small Online 模型，具备8B参数，支持约127,000个标记的上下文长度，专为在线聊天设计，能高效处理各种文本交互。',
      displayName: 'Llama 3.1 Sonar Small Online',
      id: 'llama-3.1-sonar-small-128k-online',
    },
    {
      contextWindowTokens: 127_072,
      description:
        'Llama 3.1 Sonar Large Online 模型，具备70B参数，支持约127,000个标记的上下文长度，适用于高容量和多样化聊天任务。',
      displayName: 'Llama 3.1 Sonar Large Online',
      id: 'llama-3.1-sonar-large-128k-online',
    },
    {
      contextWindowTokens: 127_072,
      description:
        'Llama 3.1 Sonar Huge Online 模型，具备405B参数，支持约127,000个标记的上下文长度，设计用于复杂的在线聊天应用。',
      displayName: 'Llama 3.1 Sonar Huge Online',
      id: 'llama-3.1-sonar-huge-128k-online',
    },
  ],
  checkModel: 'sonar',
  description:
    'Perplexity 是一家领先的对话生成模型提供商，提供多种先进的Llama 3.1模型，支持在线和离线应用，特别适用于复杂的自然语言处理任务。',
  id: 'perplexity',
  modelsUrl: 'https://docs.perplexity.ai/guides/model-cards',
  name: 'Perplexity',
  proxyUrl: {
    placeholder: 'https://api.perplexity.ai',
  },
  settings: {
    proxyUrl: {
      placeholder: 'https://api.perplexity.ai',
    },
    sdkType: 'openai',
  },
  url: 'https://www.perplexity.ai',
};

export default Perplexity;
