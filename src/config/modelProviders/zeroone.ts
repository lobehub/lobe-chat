import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.lingyiwanwu.com/docs#%E6%A8%A1%E5%9E%8B%E4%B8%8E%E8%AE%A1%E8%B4%B9
const ZeroOne: ModelProviderCard = {
  chatModels: [],
  checkModel: 'yi-lightning',
  description:
    '零一万物致力于推动以人为本的AI 2.0技术革命，旨在通过大语言模型创造巨大的经济和社会价值，并开创新的AI生态与商业模式。',
  id: 'zeroone',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.lingyiwanwu.com/docs#模型与计费',
  name: '01.AI',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.lingyiwanwu.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://www.lingyiwanwu.com/',
};

export default ZeroOne;
