import { ModelProviderCard } from '@/types/llm';

// ref: https://docs.together.ai/docs/chat-models
// ref: https://www.together.ai/pricing
const TogetherAI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'meta-llama/Llama-Vision-Free',
  description:
    'Together AI 致力于通过创新的 AI 模型实现领先的性能，提供广泛的自定义能力，包括快速扩展支持和直观的部署流程，满足企业的各种需求。',
  id: 'togetherai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.together.ai/docs/chat-models',
  name: 'Together AI',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.together.xyz/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://www.together.ai',
};

export default TogetherAI;
