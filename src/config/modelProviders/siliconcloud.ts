import { ModelProviderCard } from '@/types/llm';

// ref https://siliconflow.cn/zh-cn/models
const SiliconCloud: ModelProviderCard = {
  chatModels: [
    {
      id: 'Qwen/Qwen2-72B-Instruct',
      tokens: 32_768,
    },
    {
      id: 'Qwen/Qwen2-57B-A14B-Instruct',
      tokens: 32_768,
    },
    {
      enabled: true,
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
      id: 'deepseek-ai/DeepSeek-V2-Chat',
      tokens: 32_768,
    },
    {
      id: 'deepseek-ai/deepseek-llm-67b-chat',
      tokens: 4096,
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
  ],
  checkModel: 'Qwen/Qwen2-1.5B-Instruct',
  id: 'siliconcloud',
  modelList: { showModelFetcher: true },
  name: 'SiliconCloud',
};

export default SiliconCloud;