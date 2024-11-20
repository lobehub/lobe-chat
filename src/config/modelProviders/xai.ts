import { ModelProviderCard } from '@/types/llm';

// ref: https://x.ai/about
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
    {
      description: '最新的图像理解模型，可以处理各种各样的视觉信息，包括文档、图表、截图和照片等。',
      displayName: 'Grok Vision Beta',
      enabled: true,
      functionCall: true,
      id: 'grok-vision-beta',
      pricing: {
        input: 5,
        output: 15,
      },
      tokens: 8192,
      vision: true,
    },
  ],
  checkModel: 'grok-beta',
  description:
    'xAI 是一家致力于构建人工智能以加速人类科学发现的公司。我们的使命是推动我们对宇宙的共同理解。',
  id: 'xai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.x.ai/docs#models',
  name: 'xAI',
  proxyUrl: {
    placeholder: 'https://api.x.ai/v1',
  },
  url: 'https://x.ai/api',
};

export default XAI;
