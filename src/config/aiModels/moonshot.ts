import { AIChatModelCard } from '@/types/aiModel';

const moonshotChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      'Moonshot V1 8K 专为生成短文本任务设计，具有高效的处理性能，能够处理8,192个tokens，非常适合简短对话、速记和快速内容生成。',
    displayName: 'Moonshot V1 8K',
    enabled: true,
    id: 'moonshot-v1-8k',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Moonshot V1 32K 提供中等长度的上下文处理能力，能够处理32,768个tokens，特别适合生成各种长文档和复杂对话，应用于内容创作、报告生成和对话系统等领域。',
    displayName: 'Moonshot V1 32K',
    enabled: true,
    id: 'moonshot-v1-32k',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Moonshot V1 128K 是一款拥有超长上下文处理能力的模型，适用于生成超长文本，满足复杂的生成任务需求，能够处理多达128,000个tokens的内容，非常适合科研、学术和大型文档生成等应用场景。',
    displayName: 'Moonshot V1 128K',
    enabled: true,
    id: 'moonshot-v1-128k',
    type: 'chat',
  },
];

export const allModels = [...moonshotChatModels];

export default allModels;
