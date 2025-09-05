import { ModelProviderCard } from '@/types/llm';

const Xinference: ModelProviderCard = {
  chatModels: [],
  description:
    'Xorbits Inference (Xinference) 是一个开源平台，用于简化各种 AI 模型的运行和集成。借助 Xinference，您可以使用任何开源 LLM、嵌入模型和多模态模型在云端或本地环境中运行推理，并创建强大的 AI 应用。',
  id: 'xinference',
  modelsUrl: 'https://inference.readthedocs.io/zh-cn/latest/models/builtin/index.html',
  name: 'Xinference',
  settings: {
    proxyUrl: {
      placeholder: 'http://localhost:9997/v1',
    },
    sdkType: 'openai',
  },
  url: 'https://inference.readthedocs.io/zh-cn/v0.12.3/index.html',
};

export default Xinference;
