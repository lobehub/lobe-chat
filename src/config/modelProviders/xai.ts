import { ModelProviderCard } from '@/types/llm';

const XAI: ModelProviderCard = {
  chatModels: [
    {
      description: '拥有与 Grok 2 相当的性能，但具有更高的效率、速度和功能。',
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
