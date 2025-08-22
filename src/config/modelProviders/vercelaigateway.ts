import { ModelProviderCard } from '@/types/llm';

const VercelAIGateway: ModelProviderCard = {
  apiKeyUrl: 'https://vercel.com/dashboard/ai-gateway',
  chatModels: [],
  checkModel: 'openai/gpt-4o-mini',
  description:
    'Vercel AI Gateway 提供统一的 API 来访问 100+ 模型，通过单一端点即可使用 OpenAI、Anthropic、Google 等多个提供商的模型。支持预算设置、使用监控、请求负载均衡和故障转移。',
  enabled: true,
  id: 'vercelaigateway',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://vercel.com/ai-gateway/models',
  name: 'Vercel AI Gateway',
  settings: {
    responseAnimation: 'smooth',
    showModelFetcher: true,
  },
  url: 'https://vercel.com/ai-gateway',
};

export default VercelAIGateway;
