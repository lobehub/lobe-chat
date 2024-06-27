import { ModelProviderCard } from '@/types/llm';

// ref https://www.volcengine.com/docs/82379/1263512
const Doubao: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Doubao-pro-32k',
      enabled: true,
      id: 'ep-20240627033616-pkh7c',
      tokens: 32_768,
    },
  ],
//   checkModel: 'step-1-8k',
  id: 'doubao',
  modelList: { showModelFetcher: true },
  name: '豆包',
};

export default Doubao;