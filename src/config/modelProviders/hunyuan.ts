import { ModelProviderCard } from '@/types/llm';

// ref https://cloud.tencent.com/document/product/1729/104753
const Hunyuan: ModelProviderCard = {
  chatModels: [],
  checkModel: 'hunyuan-lite',
  description:
    '由腾讯研发的大语言模型，具备强大的中文创作能力，复杂语境下的逻辑推理能力，以及可靠的任务执行能力',
  disableBrowserRequest: true,
  id: 'hunyuan',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://cloud.tencent.com/document/product/1729/104753',
  name: 'Hunyuan',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.hunyuan.cloud.tencent.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://hunyuan.tencent.com',
};

export default Hunyuan;
