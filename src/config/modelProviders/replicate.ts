import { ModelProviderCard } from '@/types/llm';

// Ref: https://replicate.com/docs
const Replicate: ModelProviderCard = {
  chatModels: [],
  checkModel: 'black-forest-labs/flux-1.1-pro',
  description: 'Replicate 通过简单的云 API 运行 FLUX 和 Stable Diffusion 等开源图像模型。',
  id: 'replicate',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://replicate.com/explore',
  name: 'Replicate',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.replicate.com',
    },
    sdkType: 'replicate',
    showModelFetcher: true,
  },
  url: 'https://replicate.com',
};

export default Replicate;
