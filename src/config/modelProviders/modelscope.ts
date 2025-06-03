import { ModelProviderCard } from '@/types/llm';

// ref: https://modelscope.cn/docs/model-service/API-Inference/intro
const ModelScope: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 131_072,
      description: 'DeepSeek-V3是DeepSeek第三代模型，在多项基准测试中表现优异。',
      displayName: 'DeepSeek-V3-0324',
      enabled: true,
      functionCall: true,
      id: 'deepseek-ai/DeepSeek-V3-0324',
    },
    {
      contextWindowTokens: 131_072,
      description: 'DeepSeek-V3是DeepSeek第三代模型的最新版本，具有强大的推理和对话能力。',
      displayName: 'DeepSeek-V3',
      enabled: true,
      functionCall: true,
      id: 'deepseek-ai/DeepSeek-V3',
    },
    {
      contextWindowTokens: 131_072,
      description: 'DeepSeek-R1是DeepSeek最新的推理模型，专注于复杂推理任务。',
      displayName: 'DeepSeek-R1',
      enabled: true,
      functionCall: true,
      id: 'deepseek-ai/DeepSeek-R1',
    },
    {
      contextWindowTokens: 131_072,
      description: 'Qwen3-235B-A22B是通义千问3代超大规模模型，提供顶级的AI能力。',
      displayName: 'Qwen3-235B-A22B',
      enabled: true,
      functionCall: true,
      id: 'Qwen/Qwen3-235B-A22B',
    },
    {
      contextWindowTokens: 131_072,
      description: 'Qwen3-32B是通义千问3代模型，具有强大的推理和对话能力。',
      displayName: 'Qwen3-32B',
      enabled: true,
      functionCall: true,
      id: 'Qwen/Qwen3-32B',
    },
  ],
  checkModel: 'Qwen/Qwen3-32B',
  description: 'ModelScope是阿里云推出的模型即服务平台，提供丰富的AI模型和推理服务。',
  id: 'modelscope',
  modelList: { showModelFetcher: true },
  name: 'ModelScope',
  settings: {
    proxyUrl: {
      placeholder: 'https://api-inference.modelscope.cn/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://modelscope.cn',
};

export default ModelScope;
