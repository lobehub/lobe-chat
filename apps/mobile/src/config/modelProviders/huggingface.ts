import { ModelProviderCard } from '@/types/llm';

const HuggingFace: ModelProviderCard = {
  apiKeyUrl: 'https://huggingface.co/settings/tokens',
  chatModels: [
    {
      contextWindowTokens: 32_768,
      description: 'Mistral AI的指令调优模型',
      displayName: 'Mistral 7B Instruct v0.3',
      id: 'mistralai/Mistral-7B-Instruct-v0.3',
    },
    {
      contextWindowTokens: 8192,
      description: 'Google的轻量级指令调优模型',
      displayName: 'Gemma 2 2B Instruct',
      id: 'google/gemma-2-2b-it',
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
      displayName: 'Qwen 2.5 Coder 32B Instruct',
      id: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    },
    {
      contextWindowTokens: 32_768,
      description: 'Qwen QwQ 是由 Qwen 团队开发的实验研究模型，专注于提升AI推理能力。',
      displayName: 'QwQ 32B Preview',
      enabled: true,
      id: 'Qwen/QwQ-32B-Preview',
    },
    {
      contextWindowTokens: 32_768,
      displayName: 'Phi 3.5 mini instruct',
      id: 'microsoft/Phi-3.5-mini-instruct',
    },
    {
      contextWindowTokens: 16_384,
      displayName: 'Hermes 3 Llama 3.1 8B',
      id: 'NousResearch/Hermes-3-Llama-3.1-8B',
    },
    {
      contextWindowTokens: 16_384,
      displayName: 'DeepSeek R1 (Distill Qwen 32B)',
      id: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    },
    {
      contextWindowTokens: 128_000,
      displayName: 'DeepSeek R1',
      enabled: true,
      id: 'deepseek-ai/DeepSeek-R1',
    },
  ],
  checkModel: 'mistralai/Mistral-7B-Instruct-v0.2',
  description:
    'HuggingFace Inference API 提供了一种快速且免费的方式，让您可以探索成千上万种模型，适用于各种任务。无论您是在为新应用程序进行原型设计，还是在尝试机器学习的功能，这个 API 都能让您即时访问多个领域的高性能模型。',
  disableBrowserRequest: true,
  id: 'huggingface',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://huggingface.co/docs/api-inference/en/supported-models',
  name: 'HuggingFace',
  settings: {
    disableBrowserRequest: true,
    sdkType: 'huggingface',
    showModelFetcher: true,
  },
  url: 'https://huggingface.co',
};

export default HuggingFace;
