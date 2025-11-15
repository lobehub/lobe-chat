import { AIChatModelCard } from '../types/aiModel';

const nvidiaChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description:
      'MiniMax-M2 是一款紧凑、快速且经济高效的混合专家（MoE）模型，拥有 2300 亿总参数和 100 亿激活参数，专为编码和智能体任务的顶级性能而打造，同时保持强大的通用智能。该模型在多文件编辑、编码-运行-修复闭环、测试校验修复以及复杂的长链接工具链方面表现优异，是开发者工作流的理想选择。',
    displayName: 'MiniMax-M2',
    enabled: true,
    id: 'minimaxai/minimax-m2',
    maxOutput: 16_384,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek V3.1：下一代推理模型，提升了复杂推理与链路思考能力，适合需要深入分析的任务。',
    displayName: 'DeepSeek V3.1 Terminus',
    enabled: true,
    id: 'deepseek-ai/deepseek-v3.1-terminus',
    maxOutput: 16_384,
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
    description:
      'DeepSeek V3.1：下一代推理模型，提升了复杂推理与链路思考能力，适合需要深入分析的任务。',
    displayName: 'DeepSeek V3.1',
    id: 'deepseek-ai/deepseek-v3.1',
    maxOutput: 16_384,
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: '先进的 LLM，擅长推理、数学、常识和函数调用。',
    displayName: 'Llama 3.3 70B Instruct',
    id: 'meta/llama-3.3-70b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: '先进的最尖端小型语言模型，具备语言理解、卓越的推理能力和文本生成能力。',
    displayName: 'Llama 3.2 1B Instruct',
    id: 'meta/llama-3.2-1b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description: '先进的最尖端小型语言模型，具备语言理解、卓越的推理能力和文本生成能力。',
    displayName: 'Llama 3.2 3B Instruct',
    id: 'meta/llama-3.2-3b-instruct',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 128_000,
    description: '尖端的视觉-语言模型，擅长从图像中进行高质量推理。',
    displayName: 'Llama 3.2 11B Vision Instruct',
    id: 'meta/llama-3.2-11b-vision-instruct',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 128_000,
    description: '尖端的视觉-语言模型，擅长从图像中进行高质量推理。',
    displayName: 'Llama 3.2 90B Vision Instruct',
    id: 'meta/llama-3.2-90b-vision-instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: '先进的最尖端模型，具备语言理解、卓越的推理能力和文本生成能力。',
    displayName: 'Llama 3.1 8B Instruct',
    id: 'meta/llama-3.1-8b-instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description: '赋能复杂对话，具备卓越的上下文理解、推理能力和文本生成能力。',
    displayName: 'Llama 3.1 70B Instruct',
    id: 'meta/llama-3.1-70b-instruct',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      '高级 LLM，支持合成数据生成、知识蒸馏和推理，适用于聊天机器人、编程和特定领域任务。',
    displayName: 'Llama 3.1 405B Instruct',
    id: 'meta/llama-3.1-405b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '独特的语言模型，提供无与伦比的准确性和效率表现。',
    displayName: 'Llama 3.1 Nemotron 51B Instruct',
    id: 'nvidia/llama-3.1-nemotron-51b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Llama-3.1-Nemotron-70B-Instruct 是 NVIDIA 定制的大型语言模型，旨在提高 LLM 生成的响应的帮助性。',
    displayName: 'Llama 3.1 Nemotron 70B Instruct',
    id: 'nvidia/llama-3.1-nemotron-70b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '面向边缘应用的高级小型语言生成 AI 模型。',
    displayName: 'Gemma 2 2B Instruct',
    id: 'google/gemma-2-2b-it',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '尖端文本生成模型，擅长文本理解、转换和代码生成。',
    displayName: 'Gemma 2 9B Instruct',
    id: 'google/gemma-2-9b-it',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '尖端文本生成模型，擅长文本理解、转换和代码生成。',
    displayName: 'Gemma 2 27B Instruct',
    id: 'google/gemma-2-27b-it',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 128_000,
    description: '最先进的高效 LLM，擅长推理、数学和编程。',
    displayName: 'DeepSeek R1',
    id: 'deepseek-ai/deepseek-r1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: '面向中文和英文的 LLM，针对语言、编程、数学、推理等领域。',
    displayName: 'Qwen2.5 7B Instruct',
    id: 'qwen/qwen2.5-7b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '强大的中型代码模型，支持 32K 上下文长度，擅长多语言编程。',
    displayName: 'Qwen2.5 Coder 7B Instruct',
    id: 'qwen/qwen2.5-coder-7b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '高级 LLM，支持代码生成、推理和修复，涵盖主流编程语言。',
    displayName: 'Qwen2.5 Coder 32B Instruct',
    id: 'qwen/qwen2.5-coder-32b-instruct',
    type: 'chat',
  },
];

export const allModels = [...nvidiaChatModels];

export default allModels;
