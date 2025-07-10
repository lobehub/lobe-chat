import { ModelProviderCard } from '@/types/llm';

const VLLM: ModelProviderCard = {
  chatModels: [],
  description: 'vLLM 是一个快速且易于使用的库，用于 LLM 推理和服务。',
  id: 'vllm',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://docs.vllm.ai/en/latest/models/supported_models.html#supported-models',
  name: 'vLLM',
  settings: {
    proxyUrl: {
      placeholder: 'http://localhost:8000/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://docs.vllm.ai',
};

export default VLLM;
