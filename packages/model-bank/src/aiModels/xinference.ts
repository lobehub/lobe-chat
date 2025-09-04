import { AIChatModelCard } from '../types/aiModel';

const xinferenceChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek-V3 是一个强大的专家混合（MoE）语言模型，拥有总计 6710 亿参数，每个 token 激活 370 亿参数。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-v3',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek-R1 在强化学习（RL）之前引入了冷启动数据，在数学、代码和推理任务上表现可与 OpenAI-o1 相媲美。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'deepseek-r1-distill-llama 是基于 Llama 从 DeepSeek-R1 蒸馏而来的模型。',
    displayName: 'DeepSeek R1 Distill Llama',
    enabled: true,
    id: 'deepseek-r1-distill-llama',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'deepseek-r1-distill-qwen 是基于 Qwen 从 DeepSeek-R1 蒸馏而来的模型。',
    displayName: 'DeepSeek R1 Distill Qwen',
    enabled: true,
    id: 'deepseek-r1-distill-qwen',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'QwQ 是 Qwen 系列的推理模型。与传统的指令微调模型相比，QwQ 具备思考和推理能力，在下游任务中，尤其是复杂问题上，能够实现显著增强的性能。QwQ-32B 是一款中型推理模型，其性能可与最先进的推理模型（如 DeepSeek-R1、o1-mini）相媲美。',
    displayName: 'QwQ 32B',
    enabled: true,
    id: 'qwq-32b',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'QVQ-72B-Preview 是由 Qwen 团队开发的实验性研究模型，专注于提升视觉推理能力。',
    displayName: 'QVQ 72B Preview',
    enabled: true,
    id: 'qvq-72b-preview',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5 是 Qwen 大型语言模型的最新系列。对于 Qwen2.5，我们发布了多个基础语言模型和指令微调语言模型，参数范围从 5 亿到 72 亿不等。',
    displayName: 'Qwen2.5 Instruct',
    enabled: true,
    id: 'qwen2.5-instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: 'Qwen2.5-Coder 是 Qwen 系列中最新的代码专用大型语言模型（前身为 CodeQwen）。',
    displayName: 'Qwen2.5 Coder Instruct',
    enabled: true,
    id: 'qwen2.5-coder-instruct',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 128_000,
    description: 'Qwen2.5-VL 是 Qwen 模型家族中视觉语言模型的最新版本。',
    displayName: 'Qwen2.5 VL Instruct',
    enabled: true,
    id: 'qwen2.5-vl-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 1_024_000,
    description:
      'Mistral-Nemo-Instruct-2407 大型语言模型（LLM）是 Mistral-Nemo-Base-2407 的指令微调版本。',
    displayName: 'Mistral Nemo Instruct',
    enabled: true,
    id: 'mistral-nemo-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Mistral-Large-Instruct-2407 是一款先进的稠密大型语言模型（LLM），拥有 1230 亿参数，具备最先进的推理、知识和编码能力。',
    displayName: 'Mistral Large Instruct',
    enabled: true,
    id: 'mistral-large-instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Llama 3.3 指令微调模型针对对话场景进行了优化，在常见的行业基准测试中，超越了许多现有的开源聊天模型。',
    displayName: 'Llama 3.3 Instruct',
    enabled: true,
    id: 'llama-3.3-instruct',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 163_840,
    description:
      'Llama 3.2-Vision 指令微调模型针对视觉识别、图像推理、图像描述和回答与图像相关的常规问题进行了优化。',
    displayName: 'Llama 3.2 Vision Instruct',
    enabled: true,
    id: 'llama-3.2-vision-instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Llama 3.1 指令微调模型针对对话场景进行了优化，在常见的行业基准测试中，超越了许多现有的开源聊天模型。',
    displayName: 'Llama 3.1 Instruct',
    enabled: true,
    id: 'llama-3.1-instruct',
    type: 'chat',
  },
];

export const allModels = [...xinferenceChatModels];

export default allModels;
