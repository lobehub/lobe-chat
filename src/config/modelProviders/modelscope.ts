import { ModelProviderCard } from '@/types/llm';

const ModelScope: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 32_768,
      description: '阿里云通义千问团队开发的大型语言模型',
      displayName: 'Qwen 2.5 7B Instruct',
      id: 'Qwen/Qwen2.5-7B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: '阿里云通义千问团队开发的大型语言模型',
      displayName: 'Qwen 2.5 14B Instruct',
      id: 'Qwen/Qwen2.5-14B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: '阿里云通义千问团队开发的大型语言模型',
      displayName: 'Qwen 2.5 32B Instruct',
      id: 'Qwen/Qwen2.5-32B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: '阿里云通义千问团队开发的大型语言模型',
      displayName: 'Qwen 2.5 72B Instruct',
      id: 'Qwen/Qwen2.5-72B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen2.5-Coder 专注于代码编写',
      displayName: 'Qwen 2.5 Coder 7B Instruct',
      id: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen2.5-Coder 专注于代码编写',
      displayName: 'Qwen 2.5 Coder 14B Instruct',
      id: 'Qwen/Qwen2.5-Coder-14B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen2.5-Coder 专注于代码编写',
      displayName: 'Qwen 2.5 Coder 32B Instruct',
      id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen QwQ 是由 Qwen 团队开发的实验研究模型，专注于提升AI推理能力。',
      displayName: 'QwQ 32B Preview',
      id: 'Qwen/QwQ-32B-Preview',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen QwQ 是由 Qwen 团队开发的实验研究模型，专注于提升AI推理能力。',
      displayName: 'QwQ 72B Preview',
      id: 'Qwen/QwQ-72B-Preview',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Llama 是由 Meta 团队开发的大型语言模型',
      displayName: 'Llama 3.3 70B Instruct',
      id: 'LLM-Research/Llama-3.3-70B-Instruct',
    },
  ],
  checkModel: 'Qwen/Qwen2.5-32B-Instruct',
  description:
    'ModelScope Inference API 提供了一种快速且免费的方式，让您可以探索成千上万种模型，适用于各种任务。无论您是在为新应用程序进行原型设计，还是在尝试机器学习的功能，这个 API 都能让您即时访问多个领域的高性能模型。',
  disableBrowserRequest: true,
  id: 'modelscope',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://modelscope.cn/docs/model-service/API-Inference/intro',
  name: 'ModelScope',
  proxyUrl: {
    placeholder: 'https://api-inference.modelscope.cn/v1',
  },
  url: 'https://modelscope.cn',
};

export default ModelScope;
