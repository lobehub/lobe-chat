import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.deepseek.com/api-docs/pricing
const DeepSeek: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 65_536,
      description:
        '最新模型 DeepSeek-V3 多项评测成绩超越 Qwen2.5-72B 和 Llama-3.1-405B 等开源模型，性能对齐领军闭源模型 GPT-4o 与 Claude-3.5-Sonnet。',
      displayName: 'DeepSeek V3',
      enabled: true,
      functionCall: true,
      id: 'deepseek-chat',
      pricing: { // 2025.2.9 之后涨价
        cachedInput: 0.1,
        currency: 'CNY',
        input: 1,
        output: 2,
      },
      releasedAt: '2024-12-26',
    },
    {
      contextWindowTokens: 65_536,
      description:
        'DeepSeek 推出的推理模型。在输出最终回答之前，模型会先输出一段思维链内容，以提升最终答案的准确性。',
      displayName: 'DeepSeek R1',
      enabled: true,
      id: 'deepseek-reasoner',
      pricing: {
        cachedInput: 1,
        currency: 'CNY',
        input: 4,
        output: 16,
      },
      releasedAt: '2025-01-20',
    },
  ],
  checkModel: 'deepseek-chat',
  description:
    'DeepSeek 是一家专注于人工智能技术研究和应用的公司，其最新模型 DeepSeek-V3 多项评测成绩超越 Qwen2.5-72B 和 Llama-3.1-405B 等开源模型，性能对齐领军闭源模型 GPT-4o 与 Claude-3.5-Sonnet。',
  id: 'deepseek',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.deepseek.com/api-docs/zh-cn/quick_start/pricing',
  name: 'DeepSeek',
  settings: {
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://deepseek.com',
};

export default DeepSeek;
