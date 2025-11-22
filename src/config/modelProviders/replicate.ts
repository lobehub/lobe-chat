import { ModelProviderCard } from '@/types/llm';

// ref: https://replicate.com/docs
const Replicate: ModelProviderCard = {
  chatModels: [],
  checkModel: 'meta/llama-2-70b-chat',
  description:
    'Replicate lets you run machine learning models with a cloud API, without having to understand the intricacies of machine learning or manage your own infrastructure. Run open-source models like Llama, Stable Diffusion, and FLUX with a simple API.',
  id: 'replicate',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://replicate.com/explore',
  name: 'Replicate',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.replicate.com',
    },
    showModelFetcher: true,
  },
  url: 'https://replicate.com',
};

export default Replicate;
