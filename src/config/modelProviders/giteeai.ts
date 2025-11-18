import { ModelProviderCard } from '@/types/llm';

// ref: https://ai.gitee.com/serverless-api/packages/1910
const GiteeAI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'Qwen2.5-72B-Instruct',
  description: 'Gitee AI 的 Serverless API 为 AI 开发者提供开箱即用的大模型推理 API 服务。',
  disableBrowserRequest: true,
  id: 'giteeai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ai.gitee.com/docs/openapi/v1#tag/serverless/POST/chat/completions',
  name: 'Gitee AI',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://ai.gitee.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://ai.gitee.com',
};

export default GiteeAI;
