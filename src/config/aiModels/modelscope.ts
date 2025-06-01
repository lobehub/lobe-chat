import { AIChatModelCard } from '@/types/aiModel';

const modelscopeChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'DeepSeek-V3是DeepSeek第三代模型，在多项基准测试中表现优异。',
    displayName: 'DeepSeek-V3-0324',
    enabled: true,
    id: 'deepseek-ai/DeepSeek-V3-0324',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'DeepSeek-V3是DeepSeek第三代模型的最新版本，具有强大的推理和对话能力。',
    displayName: 'DeepSeek-V3',
    enabled: true,
    id: 'deepseek-ai/DeepSeek-V3',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'DeepSeek-R1是DeepSeek最新的推理模型，专注于复杂推理任务。',
    displayName: 'DeepSeek-R1',
    enabled: true,
    id: 'deepseek-ai/DeepSeek-R1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3-235B-A22B是通义千问3代超大规模模型，提供顶级的AI能力。',
    displayName: 'Qwen3-235B-A22B',
    enabled: true,
    id: 'Qwen/Qwen3-235B-A22B',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3-32B是通义千问3代模型，具有强大的推理和对话能力。',
    displayName: 'Qwen3-32B',
    enabled: true,
    id: 'Qwen/Qwen3-32B',
    type: 'chat',
  },
];

export const allModels = [...modelscopeChatModels];

export default allModels;
