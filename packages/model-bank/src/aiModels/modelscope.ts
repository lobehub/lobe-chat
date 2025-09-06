import { AIChatModelCard } from '../types/aiModel';

const modelscopeChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description:
      'kimi-k2-0905-preview 模型上下文长度为 256k，具备更强的 Agentic Coding 能力、更突出的前端代码的美观度和实用性、以及更好的上下文理解能力。',
    displayName: 'Kimi K2 0905',
    enabled: true,
    id: 'moonshotai/Kimi-K2-Instruct-0905',
    releasedAt: '2025-09-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'DeepSeek-V3.1 模型为混合推理架构模型，同时支持思考模式与非思考模式。',
    displayName: 'DeepSeek-V3.1',
    enabled: true,
    id: 'deepseek-ai/DeepSeek-V3.1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek R1 通过利用增加的计算资源和在后训练过程中引入算法优化机制，显著提高了其推理和推断能力的深度。该模型在各种基准评估中表现出色，包括数学、编程和一般逻辑方面。其整体性能现已接近领先模型，如 O3 和 Gemini 2.5 Pro。',
    displayName: 'DeepSeek-R1-0528',
    id: 'deepseek-ai/DeepSeek-R1-0528',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'DeepSeek-R1是DeepSeek最新的推理模型，专注于复杂推理任务。',
    displayName: 'DeepSeek-R1',
    id: 'deepseek-ai/DeepSeek-R1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'DeepSeek-V3是DeepSeek第三代模型的最新版本，具有强大的推理和对话能力。',
    displayName: 'DeepSeek-V3',
    id: 'deepseek-ai/DeepSeek-V3',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3-235B-A22B是通义千问3代超大规模模型，提供顶级的AI能力。',
    displayName: 'Qwen3-235B-A22B',
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
    id: 'Qwen/Qwen3-32B',
    type: 'chat',
  },
];

export const allModels = [...modelscopeChatModels];

export default allModels;
