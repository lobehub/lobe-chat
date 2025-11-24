import { AIChatModelCard } from '../types/aiModel';

const akashChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek V3.1：下一代推理模型，提升了复杂推理与链路思考能力，适合需要深入分析的任务。',
    displayName: 'DeepSeek V3.1',
    enabled: true,
    id: 'DeepSeek-V3-1',
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'GPT-OSS-120B MXFP4 量化的 Transformer 结构，在资源受限时仍能保持强劲性能。',
    displayName: 'GPT-OSS-120B',
    enabled: true,
    id: 'gpt-oss-120b',
    settings: {
      extendParams: ['reasoningEffort'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 262_144,
    description:
      'Qwen3 235B A22B Instruct 2507：面向高级推理与对话指令优化的模型，混合专家架构以在大规模参数下保持推理效率。',
    displayName: 'Qwen3 235B A22B Instruct 2507',
    id: 'Qwen3-235B-A22B-Instruct-2507-FP8',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'DeepSeek-R1-Distill-Qwen-32B',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Llama 4 Maverick：基于 Mixture-of-Experts 的大规模模型，提供高效的专家激活策略以在推理中表现优异。',
    displayName: 'Llama 4 Maverick (17Bx128E)',
    id: 'Meta-Llama-4-Maverick-17B-128E-Instruct-FP8',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Llama 3.3 70B：通用性强的 Transformer 模型，适用于对话和生成任务。',
    displayName: 'Llama 3.3 70B',
    id: 'Meta-Llama-3-3-70B-Instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'Llama 3.1 8B',
    id: 'Meta-Llama-3-1-8B-Instruct-FP8',
    type: 'chat',
  },
];
export const allModels = [...akashChatModels];

export default allModels;
