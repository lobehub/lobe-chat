import { ModelProviderCard } from '@/types/llm';

// ref https://www.volcengine.com/docs/82379/1330310
const Doubao: ModelProviderCard = {
  chatModels: [],
  // checkModel: 'Doubao-lite-4k',
  description:
    '字节跳动推出的自研大模型。通过字节跳动内部50+业务场景实践验证，每日万亿级tokens大使用量持续打磨，提供多种模态能力，以优质模型效果为企业打造丰富的业务体验。',
  id: 'doubao',
  modelsUrl: 'https://www.volcengine.com/product/doubao',
  name: '豆包',
  settings: {
    disableBrowserRequest: true, // CORS error
    sdkType: 'doubao',
    // showModelFetcher: false,
    smoothing: {
      speed: 2,
      text: true,
    },
  },
  url: 'https://www.volcengine.com/product/doubao',
};

export default Doubao;
