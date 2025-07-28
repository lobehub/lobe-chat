import { ModelProviderCard } from '@/types/llm';

// ref https://docs.ai21.com/reference/jamba-15-api-ref
const Ai21: ModelProviderCard = {
  chatModels: [],
  checkModel: 'jamba-mini',
  description: 'AI21 Labs 为企业构建基础模型和人工智能系统，加速生成性人工智能在生产中的应用。',
  id: 'ai21',
  modelsUrl: 'https://docs.ai21.com/reference',
  name: 'Ai21Labs',
  settings: {
    sdkType: 'openai',
  },
  url: 'https://studio.ai21.com',
};

export default Ai21;
