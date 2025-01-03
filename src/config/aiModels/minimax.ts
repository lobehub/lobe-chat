import { AIChatModelCard } from '@/types/aiModel';

const minimaxChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 245_760,
    description: '适用于广泛的自然语言处理任务，包括文本生成、对话系统等。',
    displayName: 'abab6.5s',
    enabled: true,
    id: 'abab6.5s-chat',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description: '专为多语种人设对话设计，支持英文及其他多种语言的高质量对话生成。',
    displayName: 'abab6.5g',
    enabled: true,
    id: 'abab6.5g-chat',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description: '针对中文人设对话场景优化，提供流畅且符合中文表达习惯的对话生成能力。',
    displayName: 'abab6.5t',
    enabled: true,
    id: 'abab6.5t-chat',
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description: '面向生产力场景，支持复杂任务处理和高效文本生成，适用于专业领域应用。',
    displayName: 'abab5.5',
    id: 'abab5.5-chat',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '专为中文人设对话场景设计，提供高质量的中文对话生成能力，适用于多种应用场景。',
    displayName: 'abab5.5s',
    id: 'abab5.5s-chat',
    type: 'chat',
  },
];

export const allModels = [...minimaxChatModels];

export default allModels;
