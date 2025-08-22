import { AIChatModelCard } from '@/types/aiModel';

// https://api-docs.deepseek.com/zh-cn/quick_start/pricing
const deepseekChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'DeepSeek V3.1 是一款支持“思考”和“非思考”两种模式的混合推理语言模型，它拥有128K的上下文窗口，并在代码、推理及智能体（Agent）能力上进行了显著优化。',
    displayName: 'DeepSeek-V3.1（非思考模式）',
    enabled: true,
    id: 'deepseek-chat',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-21',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'DeepSeek V3.1 是一款支持“思考”和“非思考”两种模式的混合推理语言模型，它拥有128K的上下文窗口，并在代码、推理及智能体（Agent）能力上进行了显著优化。',
    displayName: 'DeepSeek-V3.1（思考模式）',
    enabled: true,
    id: 'deepseek-reasoner',
    maxOutput: 65_536,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-08-21',
    type: 'chat',
  },
];

export const allModels = [...deepseekChatModels];

export default allModels;
