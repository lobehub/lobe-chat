import { ModelProviderCard } from '@/types/llm';

// ref https://www.volcengine.com/docs/82379/1330310
const Doubao: ModelProviderCard = {
  chatModels: [],
  description:
    '字节跳动推出的大模型服务的开发平台，提供功能丰富、安全以及具备价格竞争力的模型调用服务，同时提供模型数据、精调、推理、评测等端到端功能，全方位保障您的 AI 应用开发落地。',
  id: 'volcengine',
  modelsUrl: 'https://www.volcengine.com/docs/82379/1330310',
  name: '火山引擎',
  settings: {
    disableBrowserRequest: true, // CORS error
    sdkType: 'openai',
    showDeployName: true,
    smoothing: {
      speed: 2,
      text: true,
    },
  },
  url: 'https://www.volcengine.com/product/ark',
};

export default Doubao;
