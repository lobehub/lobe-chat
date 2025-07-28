import { ModelProviderCard } from '@/types/llm';

// ref https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Nlks5zkzu
const BaiduWenxin: ModelProviderCard = {
  chatModels: [],
  checkModel: 'ernie-speed-128k',
  description:
    '企业级一站式大模型与AI原生应用开发及服务平台，提供最全面易用的生成式人工智能模型开发、应用开发全流程工具链',
  id: 'wenxin',
  modelsUrl: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Nlks5zkzu#%E5%AF%B9%E8%AF%9Dchat',
  name: 'Wenxin',
  settings: {
    proxyUrl: {
      placeholder: 'https://qianfan.baidubce.com/v2',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    sdkType: 'openai',
  },
  url: 'https://cloud.baidu.com/wenxin.html',
};

export default BaiduWenxin;
