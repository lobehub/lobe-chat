import { ModelProviderCard } from '@/types/llm';

const V0: ModelProviderCard = {
  chatModels: [],
  checkModel: 'v0-1.5-md',
  description:
    'v0 是一个配对编程助手，你只需用自然语言描述想法，它就能为你的项目生成代码和用户界面（UI）',
  id: 'v0',
  modelsUrl: 'https://vercel.com/docs/v0/api#models',
  name: 'Vercel (v0)',
  settings: {
    sdkType: 'openai',
  },
  url: 'https://v0.dev',
};

export default V0;
