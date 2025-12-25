import { ModelProviderCard } from '@/types/llm';

/**
 * @see https://fal.ai/models/fal-ai/flux/schnell
 */
const Fal: ModelProviderCard = {
  chatModels: [],
  description: '面向开发者的生成式媒体平台',
  enabled: true,
  id: 'fal',
  name: 'Fal',
  settings: {
    disableBrowserRequest: true,
    showAddNewModel: false,
    showChecker: false,
    showModelFetcher: false,
  },
  url: 'https://fal.ai',
};

export default Fal;
