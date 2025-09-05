import { ModelProviderCard } from '@/types/llm';

// ref https://www.volcengine.com/docs/82379/1330310
const Doubao: ModelProviderCard = {
  chatModels: [],
  checkModel: 'doubao-1-5-lite-32k-250115',
  description:
    '字节跳动推出的大模型服务的开发平台，提供功能丰富、安全以及具备价格竞争力的模型调用服务，同时提供模型数据、精调、推理、评测等端到端功能，全方位保障您的 AI 应用开发落地。',
  id: 'volcengine',
  modelsUrl: 'https://www.volcengine.com/docs/82379/1330310',
  name: 'Volcengine',
  settings: {
    disableBrowserRequest: true, // CORS error
    proxyUrl: {
      placeholder: 'https://ark.cn-beijing.volces.com/api/v3',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    sdkType: 'openai',
    showDeployName: true,
  },
  url: 'https://www.volcengine.com/product/ark',
};

export default Doubao;
