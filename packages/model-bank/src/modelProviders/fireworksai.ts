import { ModelProviderCard } from '@/types/llm';

// ref: https://fireworks.ai/models?show=Serverless
// ref: https://fireworks.ai/pricing
const FireworksAI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'accounts/fireworks/models/llama-v3p2-3b-instruct',
  description:
    'Fireworks AI 是一家领先的高级语言模型服务商，专注于功能调用和多模态处理。其最新模型 Firefunction V2 基于 Llama-3，优化用于函数调用、对话及指令跟随。视觉语言模型 FireLLaVA-13B 支持图像和文本混合输入。其他 notable 模型包括 Llama 系列和 Mixtral 系列，提供高效的多语言指令跟随与生成支持。',
  id: 'fireworksai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://fireworks.ai/models?show=Serverless',
  name: 'Fireworks AI',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.fireworks.ai/inference/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://fireworks.ai',
};

export default FireworksAI;
