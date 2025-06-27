import { ModelProviderCard } from '@/types/llm';

const FeatherlessAI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'Qwen/Qwen2.5-32B-Instruct',
  description: 'Featherless AI 通过单一 API 提供对超过 10,000 个开源模型的访问，并采用订阅式定价。',
  disableBrowserRequest: true,
  id: 'featherlessai',
  modelsUrl: 'https://featherless.ai/models',
  name: 'Featherless AI',
  settings: {
    disableBrowserRequest: true,
    sdkType: 'openai',
  },
  url: 'https://featherless.ai',
};

export default FeatherlessAI; 