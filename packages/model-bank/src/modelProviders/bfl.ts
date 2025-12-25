import { ModelProviderCard } from '@/types/llm';

/**
 * @see https://docs.bfl.ai/
 */
const Bfl: ModelProviderCard = {
  chatModels: [],
  description: '领先的前沿人工智能研究实验室，构建明日的视觉基础设施。',
  enabled: true,
  id: 'bfl',
  name: 'Black Forest Labs',
  settings: {
    disableBrowserRequest: true,
    showAddNewModel: false,
    showChecker: false,
    showModelFetcher: false,
  },
  url: 'https://bfl.ai/',
};

export default Bfl;
