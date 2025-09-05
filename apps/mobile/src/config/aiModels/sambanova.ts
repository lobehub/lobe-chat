import { AIChatModelCard } from '@/types/aiModel';

const sambanovaChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_000,
    description:
      'Llama 3.3 是 Llama 系列最先进的多语言开源大型语言模型，以极低成本体验媲美 405B 模型的性能。基于 Transformer 结构，并通过监督微调（SFT）和人类反馈强化学习（RLHF）提升有用性和安全性。其指令调优版本专为多语言对话优化，在多项行业基准上表现优于众多开源和封闭聊天模型。知识截止日期为 2023 年 12 月',
    displayName: 'Meta Llama 3.3 70B Instruct',
    enabled: true,
    id: 'Meta-Llama-3.3-70B-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_000,
    description: '先进的最尖端小型语言模型，具备语言理解、卓越的推理能力和文本生成能力。',
    displayName: 'Meta Llama 3.2 1B Instruct',
    id: 'Meta-Llama-3.2-1B-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.04, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.08, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8000,
    description: '先进的最尖端小型语言模型，具备语言理解、卓越的推理能力和文本生成能力。',
    displayName: 'Meta Llama 3.2 3B Instruct',
    id: 'Meta-Llama-3.2-3B-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.08, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4000,
    description: '在高分辨率图像上表现出色的图像推理能力，适用于视觉理解应用。',
    displayName: 'Meta Llama 3.2 11B Vision Instruct',
    enabled: true,
    id: 'Llama-3.2-11B-Vision-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4000,
    description: '适用于视觉理解代理应用的高级图像推理能力。',
    displayName: 'Meta Llama 3.2 90B Vision Instruct',
    enabled: true,
    id: 'Llama-3.2-90B-Vision-Instruct	',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_000,
    description:
      'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
    displayName: 'Meta Llama 3.1 8B Instruct',
    id: 'Meta-Llama-3.1-8B-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
    displayName: 'Meta Llama 3.1 70B Instruct',
    id: 'Meta-Llama-3.1-70B-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 16_000,
    description:
      'Llama 3.1指令调优的文本模型，针对多语言对话用例进行了优化，在许多可用的开源和封闭聊天模型中，在常见行业基准上表现优异。',
    displayName: 'Meta Llama 3.1 405B Instruct',
    id: 'Meta-Llama-3.1-405B-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_000,
    displayName: 'Llama 3.1 Tulu 3 405B',
    id: 'Llama-3.1-Tulu-3-405B',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.7, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 4000,
    description: '最先进的高效 LLM，擅长推理、数学和编程。',
    displayName: 'DeepSeek R1',
    id: 'DeepSeek-R1',
    pricing: {
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 7, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    description:
      'DeepSeek R1——DeepSeek 套件中更大更智能的模型——被蒸馏到 Llama 70B 架构中。基于基准测试和人工评估，该模型比原始 Llama 70B 更智能，尤其在需要数学和事实精确性的任务上表现出色。',
    displayName: 'DeepSeek R1 Distill Llama 70B',
    enabled: true,
    id: 'DeepSeek-R1-Distill-Llama-70B',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.7, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 16_000,
    description: 'Qwen QwQ 是由 Qwen 团队开发的实验研究模型，专注于提升AI推理能力。',
    displayName: 'QwQ 32B Preview',
    enabled: true,
    id: 'QwQ-32B-Preview',
    pricing: {
      units: [
        { name: 'textInput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_000,
    description: '面向中文和英文的 LLM，针对语言、编程、数学、推理等领域。',
    displayName: 'Qwen2.5 72B Instruct',
    enabled: true,
    id: 'Qwen2.5-72B-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_000,
    description: '高级 LLM，支持代码生成、推理和修复，涵盖主流编程语言。',
    displayName: 'Qwen2.5 Coder 32B Instruct',
    enabled: true,
    id: 'Qwen2.5-Coder-32B-Instruct',
    pricing: {
      units: [
        { name: 'textInput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...sambanovaChatModels];

export default allModels;
