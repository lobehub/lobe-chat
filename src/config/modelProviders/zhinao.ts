import { ModelProviderCard } from '@/types/llm';

// ref https://ai.360.cn/platform/docs/overview
const Zhinao: ModelProviderCard = {
  chatModels: [
    {
      displayName: '360 GPT S2 V9',
      enabled: true,
      id: '360GPT_S2_V9',
    },
    {
      displayName: '360 GPT S2 V9.4',
      enabled: true,
      id: '360GPT_S2_V9.4',
    },
  ],
  checkModel: '360GPT_S2_V9',
  id: 'zhinao',
  modelList: { showModelFetcher: true },
  name: 'Zhinao',
};

export default Zhinao;
