import { ModelProviderCard } from '@/types/llm';

// ref https://platform.sensenova.cn/pricing
// ref https://platform.sensenova.cn/release?path=/release-202409.md
const SenseNova: ModelProviderCard = {
  chatModels: [],
  checkModel: 'SenseChat-Turbo',
  description: '商汤日日新，依托商汤大装置的强大的基础支撑，提供高效易用的全栈大模型服务。',
  disableBrowserRequest: true,
  id: 'sensenova',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.sensenova.cn/pricing',
  name: 'SenseNova',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.sensenova.cn/compatible-mode/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://platform.sensenova.cn/home',
};

export default SenseNova;
