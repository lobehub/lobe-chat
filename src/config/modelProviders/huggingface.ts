import { ModelProviderCard } from '@/types/llm';

const HuggingFace: ModelProviderCard = {
  chatModels: [
    {
      description: 'Mistral AI的指令调优模型',
      displayName: 'Mistral 7B Instruct v0.2',
      enabled: true,
      id: 'mistralai/Mistral-7B-Instruct-v0.2',
      tokens: 8192,
    },
    {
      description: '高质量多语言聊天模型,具有大型上下文长度',
      displayName: 'Meta Llama 3.1 70B Instruct',
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      tokens: 32_768,
    },
    {
      description: '高质量多语言聊天模型,具有较大上下文长度',
      displayName: 'Meta Llama 3.1 8B Instruct',
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      tokens: 8192,
    },
    {
      description: '最佳对话模型之一',
      displayName: 'Llama 2 7B Chat',
      id: 'meta-llama/Llama-2-7b-chat-hf',
      tokens: 4096,
    },
    {
      description: 'Google的轻量级指令调优模型',
      displayName: 'Gemma 2B Instruct',
      id: 'google/gemma-2-2b-it',
      tokens: 8192,
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
  url: 'https://huggingface.co',
};

export default HuggingFace;
