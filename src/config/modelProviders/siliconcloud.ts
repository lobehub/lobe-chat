import { ModelProviderCard } from '@/types/llm';

// ref https://siliconflow.cn/zh-cn/models
const SiliconCloud: ModelProviderCard = {
  chatModels: [
    {
      enabled: true,
      id: 'Qwen/Qwen2-72B-Instruct',
      tokens: 32_768,
    },
    {
      enabled: true,
      id: 'Qwen/Qwen2-Math-72B-Instruct',
      tokens: 32_768,
    },
    {
      enabled: true,
      id: 'Qwen/Qwen2-57B-A14B-Instruct',
      tokens: 32_768,
    },
    {
      id: 'Qwen/Qwen2-7B-Instruct',
      tokens: 32_768,
    },
    {
      id: 'Qwen/Qwen2-1.5B-Instruct',
      tokens: 32_768,
    },
    {
      id: 'Qwen/Qwen1.5-110B-Chat',
      tokens: 32_768,
    },
    {
      id: 'Qwen/Qwen1.5-32B-Chat',
      tokens: 32_768,
    },
    {
      id: 'Qwen/Qwen1.5-14B-Chat',
      tokens: 32_768,
    },
    {
      id: 'Qwen/Qwen1.5-7B-Chat',
      tokens: 32_768,
    },
    {
      id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
      tokens: 32_768,
    },
    {
      enabled: true,
      id: 'deepseek-ai/DeepSeek-V2-Chat',
      tokens: 32_768,
    },
    {
      id: 'deepseek-ai/deepseek-llm-67b-chat',
      tokens: 32_768,
    },
    {
      id: 'THUDM/glm-4-9b-chat',
      tokens: 32_768,
    },
    {
      id: 'THUDM/chatglm3-6b',
      tokens: 32_768,
    },
    {
      enabled: true,
      id: '01-ai/Yi-1.5-34B-Chat-16K',
      tokens: 16_384,
    },
    {
      id: '01-ai/Yi-1.5-9B-Chat-16K',
      tokens: 16_384,
    },
    {
      id: '01-ai/Yi-1.5-6B-Chat',
      tokens: 4096,
    },
    {
      id: 'internlm/internlm2_5-7b-chat',
      tokens: 32_768,
    },
    {
      id: 'google/gemma-2-9b-it',
      tokens: 8192,
    },
    {
      id: 'google/gemma-2-27b-it',
      tokens: 8192,
    },
    {
      id: 'internlm/internlm2_5-20b-chat',
      tokens: 32_768,
    },
    {
      id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      tokens: 32_768,
    },
    {
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      tokens: 32_768,
    },
    {
      id: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
      tokens: 32_768,
    },
    {
      id: 'meta-llama/Meta-Llama-3-70B-Instruct',
      tokens: 8192,
    },
    {
      id: 'mistralai/Mistral-7B-Instruct-v0.2',
      tokens: 32_768,
    },
    {
      id: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      tokens: 32_768,
    },
  ],
  checkModel: 'Qwen/Qwen2-1.5B-Instruct',
  id: 'siliconcloud',
  modelList: { showModelFetcher: true },
  name: 'SiliconCloud',
  proxyUrl: {
    placeholder: 'https://api.siliconflow.cn/v1',
  },
};

export default SiliconCloud;
