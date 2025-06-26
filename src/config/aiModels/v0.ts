import { AIChatModelCard } from '@/types/aiModel';

const v0ChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 512_000,
    description:
      'v0-1.5-lg 模型适用于高级思考或推理任务',
    displayName: 'v0-1.5-lg',
    enabled: true,
    id: 'v0-1.5-lg',
    maxOutput: 32_000,
    pricing: {
      input: 15,
      output: 75,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'v0-1.5-md 模型适用于日常任务和用户界面（UI）生成',
    displayName: 'v0-1.5-md',
    enabled: true,
    id: 'v0-1.5-md',
    maxOutput: 32_000,
    pricing: {
      input: 3,
      output: 15,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'v0-1.0-md 模型是通过 v0 API 提供服务的旧版模型',
    displayName: 'v0-1.0-md',
    id: 'v0-1.0-md',
    maxOutput: 32_000,
    pricing: {
      input: 3,
      output: 15,
    },
    type: 'chat',
  },
];

export const allModels = [...v0ChatModels];

export default allModels;
