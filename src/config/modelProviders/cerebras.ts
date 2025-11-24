import { ModelProviderCard } from '@/types/llm';

const Cerebras: ModelProviderCard = {
  chatModels: [],
  checkModel: 'llama3.1-8b',
  description:
    'Cerebras 是一个基于其专用 CS-3 系统的 AI 推理平台，旨在提供全球最快、实时响应、高吞吐量的 LLM 服务，专为消除延迟和加速复杂的 AI 工作流（如实时代码生成和代理任务）而设计。',
  id: 'cerebras',
  modelsUrl: 'https://inference-docs.cerebras.ai/models/overview',
  name: 'Cerebras',
  settings: {
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://cerebras.ai',
};

export default Cerebras;
