import { ModelProviderCard } from '@/types/llm';

// ref: https://modelscope.cn/docs/model-service/API-Inference/intro
const ModelScope: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek R1 通过利用增加的计算资源和在后训练过程中引入算法优化机制，显著提高了其推理和推断能力的深度。该模型在各种基准评估中表现出色，包括数学、编程和一般逻辑方面。其整体性能现已接近领先模型，如 O3 和 Gemini 2.5 Pro。',
      displayName: 'DeepSeek-R1-0528',
      enabled: true,
      functionCall: true,
      id: 'deepseek-ai/DeepSeek-R1-0528',
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
