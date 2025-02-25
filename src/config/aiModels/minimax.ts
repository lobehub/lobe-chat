import { AIChatModelCard } from '@/types/aiModel';

const minimaxChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 1_000_192,
    description: '在 MiniMax-01系列模型中，我们做了大胆创新：首次大规模实现线性注意力机制，传统 Transformer架构不再是唯一的选择。这个模型的参数量高达4560亿，其中单次激活459亿。模型综合性能比肩海外顶尖模型，同时能够高效处理全球最长400万token的上下文，是GPT-4o的32倍，Claude-3.5-Sonnet的20倍。',
    displayName: 'MiniMax-Text-01',
    enabled: true,
    id: 'MiniMax-Text-01',
    maxOutput: 1_000_192,
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 8,
    },
    releasedAt: '2025-01-15',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 245_760,
    description: '适用于广泛的自然语言处理任务，包括文本生成、对话系统等。',
    displayName: 'abab6.5s',
    enabled: true,
    id: 'abab6.5s-chat',
    maxOutput: 245_760,
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 1,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 64_000,
    description: 'DeepSeek 推出的推理模型。在输出最终回答之前，模型会先输出一段思维链内容，以提升最终答案的准确性。',
    displayName: 'DeepSeek R1',
    id: 'DeepSeek-R1',
    maxOutput: 64_000,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    type: 'chat',
  },
];

export const allModels = [...minimaxChatModels];

export default allModels;
