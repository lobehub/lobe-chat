import { ModelProviderCard } from '@/types/llm';

const V0: ModelProviderCard = {
  chatModels: [],
  checkModel: 'v0-1.5-md',
  description:
    'Vercel 是一个面向开发者的平台，提供构建和部署 Web 应用所需的工具、工作流和基础设施，无需额外配置，即可更快速地完成开发与上线。',
  id: 'vercel',
  modelsUrl: 'https://vercel.com/docs/v0/api#models',
  name: 'vercel',
  settings: {
    sdkType: 'openai',
  },
  url: 'https://v0.dev',
};

export default V0;
