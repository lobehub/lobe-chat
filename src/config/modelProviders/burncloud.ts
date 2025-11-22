import { ModelProviderCard } from '@/types/llm';

// ref: https://ai.burncloud.com
const BurnCloud: ModelProviderCard = {
  chatModels: [],
  checkModel: 'gpt-4o-mini',
  description:
    'BurnCloud LLMs Gateway 提供兼容 OpenAI 的多租户 API，与访问令牌治理、统一路由和可观测体系结合，可在一个入口聚合 GPT-4.1、GPT-4o、o3 等模型。',
  id: 'burncloud',
  modelsUrl: 'https://ai.burncloud.com',
  name: 'BurnCloud',
  settings: {
    proxyUrl: {
      placeholder: 'https://ai.burncloud.com/v1',
    },
    sdkType: 'openai',
  },
  url: 'https://www.burncloud.com',
};

export default BurnCloud;
