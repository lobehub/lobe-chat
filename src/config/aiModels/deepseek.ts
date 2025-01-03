import { AIChatModelCard } from '@/types/aiModel';

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
    pricing: {
      cachedInput: 0.5,
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    releasedAt: '2024-12-26',
    type: 'chat',
  },
];

export const allModels = [...deepseekChatModels];

export default allModels;
