import { AIChatModelCard } from '@/types/aiModel';

const ai360ChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 8192,
    description:
      '360GPT2 Pro 是 360 公司推出的高级自然语言处理模型，具备卓越的文本生成和理解能力，尤其在生成与创作领域表现出色，能够处理复杂的语言转换和角色演绎任务。',
    displayName: '360GPT2 Pro',
    enabled: true,
    id: '360gpt2-pro',
    maxOutput: 7000,
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 5,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      '360GPT Pro 作为 360 AI 模型系列的重要成员，以高效的文本处理能力满足多样化的自然语言应用场景，支持长文本理解和多轮对话等功能。',
    displayName: '360GPT Pro',
    enabled: true,
    id: '360gpt-pro',
    maxOutput: 7000,
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 5,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '360GPT Turbo 提供强大的计算和对话能力，具备出色的语义理解和生成效率，是企业和开发者理想的智能助理解决方案。',
    displayName: '360GPT Turbo',
    enabled: true,
    id: '360gpt-turbo',
    maxOutput: 7000,
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '360GPT Turbo Responsibility 8K 强调语义安全和责任导向，专为对内容安全有高度要求的应用场景设计，确保用户体验的准确性与稳健性。',
    displayName: '360GPT Turbo Responsibility 8K',
    enabled: true,
    id: '360gpt-turbo-responsibility-8k',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 2,
    },
    type: 'chat',
  },
];

export const allModels = [...ai360ChatModels];

export default allModels;
