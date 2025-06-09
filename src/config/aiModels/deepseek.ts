import { AIChatModelCard } from '@/types/aiModel';

// https://api-docs.deepseek.com/zh-cn/quick_start/pricing
const deepseekChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description:
      '最新模型 DeepSeek-V3 多项评测成绩超越 Qwen2.5-72B 和 Llama-3.1-405B 等开源模型，性能对齐领军闭源模型 GPT-4o 与 Claude-3.5-Sonnet。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-chat',
    maxOutput: 8192,
    pricing: {
      cachedInput: 0.5,
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    releasedAt: '2025-03-24',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek 推出的推理模型。在输出最终回答之前，模型会先输出一段思维链内容，以提升最终答案的准确性。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-reasoner',
    maxOutput: 8192,
    pricing: {
      cachedInput: 1,
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    releasedAt: '2025-05-28',
    type: 'chat',
  },
];

export const allModels = [...deepseekChatModels];

export default allModels;
