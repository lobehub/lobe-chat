import { AIChatModelCard } from '../types/aiModel';

const ollamaCloudModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      'MiniMax M2 是专为编码和代理工作流程构建的高效大型语言模型。',
    displayName: 'MiniMax M2',
    enabled: true,
    id: 'minimax-m2',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 200_000,
    description:
      '智谱最新旗舰模型 GLM-4.6 (355B) 在高级编码、长文本处理、推理与智能体能力上全面超越前代，尤其在编程能力上对齐 Claude Sonnet 4，成为国内顶尖的 Coding 模型。',
    displayName: 'GLM-4.6',
    enabled: true,
    id: 'glm-4.6',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek V3.1：下一代推理模型，提升了复杂推理与链路思考能力，适合需要深入分析的任务。',
    displayName: 'DeepSeek V3.1',
    enabled: true,
    id: 'deepseek-v3.1:671b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GPT-OSS 20B 是 OpenAI 发布的开源大语言模型，采用 MXFP4 量化技术，适合在高端消费级GPU或Apple Silicon Mac上运行。该模型在对话生成、代码编写和推理任务方面表现出色，支持函数调用和工具使用。',
    displayName: 'GPT-OSS 20B',
    id: 'gpt-oss:20b',
    releasedAt: '2025-08-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'GPT-OSS 120B 是 OpenAI 发布的大型开源语言模型，采用 MXFP4 量化技术，为旗舰级模型。需要多GPU或高性能工作站环境运行，在复杂推理、代码生成和多语言处理方面具备卓越性能，支持高级函数调用和工具集成。',
    displayName: 'GPT-OSS 120B',
    id: 'gpt-oss:120b',
    releasedAt: '2025-08-05',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Kimi K2 是由月之暗面 AI 开发的大规模混合专家 (MoE) 语言模型，具有 1 万亿总参数和每次前向传递 320 亿激活参数。它针对代理能力进行了优化，包括高级工具使用、推理和代码合成。',
    displayName: 'Kimi K2',
    id: 'kimi-k2:1t',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 262_144,
    description: '阿里巴巴针对代理和编码任务的高性能长上下文模型。',
    displayName: 'Qwen3 Coder 480B',
    id: 'qwen3-coder:480b',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    displayName: 'Qwen3 VL 235B',
    id: 'qwen3-vl:235b',
    type: 'chat',
  },
];

export const allModels = [...ollamaCloudModels];

export default allModels;
