import { ModelProviderCard } from '@/types/llm';

// ref: https://modelscope.cn/docs/model-service/API-Inference/intro
const ModelScope: ModelProviderCard = {
  chatModels: [],
  checkModel: 'Qwen/Qwen3-4B',
  description: 'ModelScope是阿里云推出的模型即服务平台，提供丰富的AI模型和推理服务。',
  id: 'modelscope',
  modelList: { showModelFetcher: true },
  name: 'ModelScope',
  settings: {
    disableBrowserRequest: true, // CORS Error
    proxyUrl: {
      placeholder: 'https://api-inference.modelscope.cn/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://modelscope.cn',
};

export default ModelScope;
