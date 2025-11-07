import { ModelProviderCard } from '@/types/llm';

const HuggingFace: ModelProviderCard = {
  apiKeyUrl: 'https://huggingface.co/settings/tokens',
  chatModels: [],
  checkModel: 'mistralai/Mistral-7B-Instruct-v0.2',
  description:
    'HuggingFace Inference API 提供了一种快速且免费的方式，让您可以探索成千上万种模型，适用于各种任务。无论您是在为新应用程序进行原型设计，还是在尝试机器学习的功能，这个 API 都能让您即时访问多个领域的高性能模型。',
  disableBrowserRequest: true,
  id: 'huggingface',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://huggingface.co/docs/api-inference/en/supported-models',
  name: 'HuggingFace',
  settings: {
    disableBrowserRequest: true,
    sdkType: 'huggingface',
    showModelFetcher: true,
  },
  url: 'https://huggingface.co',
};

export default HuggingFace;
