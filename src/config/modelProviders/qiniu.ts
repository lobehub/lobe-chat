import { ModelProviderCard } from '@/types/llm';

// ref: https://developer.qiniu.com/aitokenapi
const Qiniu: ModelProviderCard = {
  chatModels: [],
  checkModel: 'deepseek-r1',
  description: '七牛作为老牌云服务厂商，提供高性价比稳定的实时、批量 AI 推理服务，简单易用。',
  id: 'qiniu',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://developer.qiniu.com/aitokenapi/12882/ai-inference-api',
  name: 'Qiniu',
  settings: {
    proxyUrl: {
      placeholder: 'https://openai.qiniu.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://www.qiniu.com',
};

export default Qiniu;
