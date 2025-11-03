import { ModelProviderCard } from '@/types/llm';

const Anthropic: ModelProviderCard = {
  chatModels: [],
  checkModel: 'claude-3-haiku-20240307',
  description:
    'Anthropic 是一家专注于人工智能研究和开发的公司，提供了一系列先进的语言模型，如 Claude 3.5 Sonnet、Claude 3 Sonnet、Claude 3 Opus 和 Claude 3 Haiku。这些模型在智能、速度和成本之间取得了理想的平衡，适用于从企业级工作负载到快速响应的各种应用场景。Claude 3.5 Sonnet 作为其最新模型，在多项评估中表现优异，同时保持了较高的性价比。',
  enabled: true,
  id: 'anthropic',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.anthropic.com/en/docs/about-claude/models#model-names',
  name: 'Anthropic',
  proxyUrl: {
    placeholder: 'https://api.anthropic.com',
  },
  settings: {
    proxyUrl: {
      placeholder: 'https://api.anthropic.com',
    },
    responseAnimation: 'smooth',
    sdkType: 'anthropic',
    showModelFetcher: true,
  },
  url: 'https://anthropic.com',
};

export default Anthropic;
