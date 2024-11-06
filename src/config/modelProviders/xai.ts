import { ModelProviderCard } from '@/types/llm';

const XAI: ModelProviderCard = {
  chatModels: [
    {
      description: 'Comparable performance to Grok 2 but with improved efficiency, speed and capabilities.',
      displayName: 'Grok Beta',
      enabled: true,
      functionCall: true,
      id: 'grok-beta',
      pricing: {
        input: 5,
        output: 15,
      },
      tokens: 131_072,
    },
  ],
  checkModel: 'grok-beta',
  id: 'xai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.x.ai/docs#models',
  name: 'xAI',
  url: 'https://console.x.ai',
};

export default XAI;
