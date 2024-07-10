import { ModelProviderCard } from '@/types/llm';

// ref https://chat.xverse.cn/home/index.html
// ref https://chat.xverse.cn/docs/api-reference
const Xverse: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'XVERSE-13B-2',
      enabled: true,
      functionCall: false,
      id: 'XVERSE-13B-2',
      maxOutput: 2048,
      tokens: 16_384,
    },
    {
      displayName: 'XVERSE-65B-2',
      enabled: true,
      functionCall: false,
      id: 'XVERSE-65B-2',
      maxOutput: 2048,
      tokens: 8192,
    },
  ],
  checkModel: 'XVERSE-13B-2',
  id: 'xverse',
  modelList: { showModelFetcher: true },
  name: 'Xverse',
};

export default Xverse;
