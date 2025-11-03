import { ModelProviderCard } from '@/types/llm';

// ref: https://docs.mistral.ai/getting-started/models/
// ref: https://docs.mistral.ai/capabilities/function_calling/
const Mistral: ModelProviderCard = {
  chatModels: [],
  checkModel: 'ministral-3b-latest',
  description:
    'Mistral 提供先进的通用、专业和研究型模型，广泛应用于复杂推理、多语言任务、代码生成等领域，通过功能调用接口，用户可以集成自定义功能，实现特定应用。',
  id: 'mistral',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.mistral.ai/getting-started/models',
  name: 'Mistral',
  settings: {
    disableBrowserRequest: true, // CORS Error
    proxyUrl: {
      placeholder: 'https://api.mistral.ai',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://mistral.ai',
};

export default Mistral;
