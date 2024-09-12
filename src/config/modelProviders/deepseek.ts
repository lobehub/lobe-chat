import { ModelProviderCard } from '@/types/llm';

// ref https://platform.deepseek.com/api-docs/pricing
const DeepSeek: ModelProviderCard = {
  chatModels: [
    {
      description:
        '融合通用与代码能力的全新开源模型, 不仅保留了原有 Chat 模型的通用对话能力和 Coder 模型的强大代码处理能力，还更好地对齐了人类偏好。此外，DeepSeek-V2.5 在写作任务、指令跟随等多个方面也实现了大幅提升。',
      displayName: 'DeepSeek-V2.5',
      enabled: true,
      functionCall: true,
      id: 'deepseek-chat',
      pricing: {
        cachedInput: 0.014,
        input: 0.14,
        output: 0.28,
      },
      releasedAt: '2024-09-05',
      tokens: 128_000,
    },
  ],
  checkModel: 'deepseek-chat',
  id: 'deepseek',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.deepseek.com/api-docs/zh-cn/quick_start/pricing',
  name: 'DeepSeek',
  url: 'https://deepseek.com',
};

export default DeepSeek;
