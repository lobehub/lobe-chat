import { ModelProviderCard } from '@/types/llm';

// ref https://docs.ai21.com/reference/jamba-15-api-ref
const Ai21: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 256_000,
      displayName: 'Jamba 1.5 Mini',
      enabled: true,
      functionCall: true,
      id: 'jamba-1.5-mini',
      pricing: {
        input: 0.2,
        output: 0.4,
      },
    },
    {
      contextWindowTokens: 256_000,
      displayName: 'Jamba 1.5 Large',
      enabled: true,
      functionCall: true,
      id: 'jamba-1.5-large',
      pricing: {
        input: 2,
        output: 8,
      },
    },
  ],
  checkModel: 'jamba-1.5-mini',
  description: 'AI21 Labs 为企业构建基础模型和人工智能系统，加速生成性人工智能在生产中的应用。',
  id: 'ai21',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.ai21.com/reference',
  name: 'Ai21Labs',
  settings: {
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://studio.ai21.com',
};

export default Ai21;
