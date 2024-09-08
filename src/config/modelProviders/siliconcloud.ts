import { ModelProviderCard } from '@/types/llm';

// ref https://siliconflow.cn/zh-cn/models
const SiliconCloud: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Qwen2 1.5B',
      id: 'Qwen/Qwen2-1.5B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen2 7B',
      enabled: true,
      id: 'Qwen/Qwen2-7B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen2 57B A14B',
      id: 'Qwen/Qwen2-57B-A14B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen2 72B',
      enabled: true,
      id: 'Qwen/Qwen2-72B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen2 Math 72B',
      enabled: true,
      id: 'Qwen/Qwen2-Math-72B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen1.5 7B',
      id: 'Qwen/Qwen1.5-7B-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen1.5 14B',
      id: 'Qwen/Qwen1.5-14B-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen1.5 32B',
      id: 'Qwen/Qwen1.5-32B-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'Qwen1.5 110B',
      id: 'Qwen/Qwen1.5-110B-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'Yi-1.5 6B',
      id: '01-ai/Yi-1.5-6B-Chat',
      tokens: 4096,
    },
    {
      displayName: 'Yi-1.5 9B',
      enabled: true,
      id: '01-ai/Yi-1.5-9B-Chat-16K',
      tokens: 16_384,
    },
    {
      displayName: 'Yi-1.5 34B',
      enabled: true,
      id: '01-ai/Yi-1.5-34B-Chat-16K',
      tokens: 16_384,
    },
    {
      displayName: 'GLM-3 6B',
      id: 'THUDM/chatglm3-6b',
      tokens: 32_768,
    },
    {
      displayName: 'GLM-4 9B',
      enabled: true,
      id: 'THUDM/glm-4-9b-chat',
      tokens: 32_768,
    },
    {
      displayName: 'Internlm 2.5 7B',
      enabled: true,
      id: 'internlm/internlm2_5-7b-chat',
      tokens: 32_768,
    },
    {
      displayName: 'Internlm 2.5 20B',
      enabled: true,
      id: 'internlm/internlm2_5-20b-chat',
      tokens: 32_768,
    },
    {
      displayName: 'DeepSeek V2 Chat',
      id: 'deepseek-ai/DeepSeek-V2-Chat',
      tokens: 32_768,
    },
    {
      displayName: 'DeepSeek V2 Coder',
      id: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'DeepSeek LLM 67B',
      id: 'deepseek-ai/deepseek-llm-67b-chat',
      tokens: 32_768,
    },
    {
      displayName: 'Gemma 2 9B',
      enabled: true,
      id: 'google/gemma-2-9b-it',
      tokens: 8192,
    },
    {
      displayName: 'Gemma 2 27B',
      enabled: true,
      id: 'google/gemma-2-27b-it',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3.1 8B',
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Llama 3.1 70B',
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Llama 3.1 405B',
      enabled: true,
      id: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
      tokens: 32_768,
    },
    {
      displayName: 'Llama 3 70B',
      id: 'meta-llama/Meta-Llama-3-70B-Instruct',
      tokens: 8192,
    },
    {
      displayName: 'Mistral 7B',
      id: 'mistralai/Mistral-7B-Instruct-v0.2',
      tokens: 32_768,
    },
    {
      displayName: 'Mistral 8x7B',
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
