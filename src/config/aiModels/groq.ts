import { AIChatModelCard } from '@/types/aiModel';

// https://groq.com/pricing/
// https://console.groq.com/docs/models

const groqChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'Qwen QwQ 32B',
    id: 'qwen-qwq-32b',
    pricing: {
      input: 0.29,
      output: 0.39,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'DeepSeek R1 Distill Llama 70B',
    enabled: true,
    id: 'deepseek-r1-distill-llama-70b',
    pricing: {
      input: 0.75, // 0.75 - 5.00
      output: 0.99, // 0.99 - 5.00
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    displayName: 'DeepSeek R1 Distill Llama 70B SpecDec',
    id: 'deepseek-r1-distill-llama-70b-specdec',
    maxOutput: 16_384,
    pricing: {
      input: 0.75,
      output: 0.99,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    enabled: true,
    id: 'deepseek-r1-distill-qwen-32b',
    maxOutput: 16_384,
    pricing: {
      input: 0.69,
      output: 0.69,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description: 'Gemma 2 9B 是一款优化用于特定任务和工具整合的模型。',
    displayName: 'Gemma 2 9B',
    id: 'gemma2-9b-it',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Llama 3.1 8B 是一款高效能模型，提供了快速的文本生成能力，非常适合需要大规模效率和成本效益的应用场景。',
    displayName: 'Llama 3.1 8B Instant',
    id: 'llama-3.1-8b-instant',
    maxOutput: 8192,
    pricing: {
      input: 0.05,
      output: 0.08,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Llama 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
    displayName: 'Llama 3.2 11B Vision (Preview)',
    id: 'llama-3.2-11b-vision-preview',
    maxOutput: 8192,
    pricing: {
      input: 0.18,
      output: 0.18,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Llama 3.2 旨在处理结合视觉和文本数据的任务。它在图像描述和视觉问答等任务中表现出色，跨越了语言生成和视觉推理之间的鸿沟。',
    displayName: 'Llama 3.2 90B Vision (Preview)',
    enabled: true,
    id: 'llama-3.2-90b-vision-preview',
    maxOutput: 8192,
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    displayName: 'Llama 3.2 1B (Preview)',
    id: 'llama-3.2-1b-preview',
    maxOutput: 8192,
    pricing: {
      input: 0.04,
      output: 0.04,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    displayName: 'Llama 3.2 3B (Preview)',
    id: 'llama-3.2-3b-preview',
    maxOutput: 8192,
    pricing: {
      input: 0.06,
      output: 0.06,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    displayName: 'Llama 3.3 70B SpecDec',
    id: 'llama-3.3-70b-specdec',
    pricing: {
      input: 0.59,
      output: 0.99,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Meta Llama 3.3 多语言大语言模型 ( LLM ) 是 70B（文本输入/文本输出）中的预训练和指令调整生成模型。 Llama 3.3 指令调整的纯文本模型针对多语言对话用例进行了优化，并且在常见行业基准上优于许多可用的开源和封闭式聊天模型。',
    displayName: 'Llama 3.3 70B Versatile',
    enabled: true,
    id: 'llama-3.3-70b-versatile',
    maxOutput: 32_768,
    pricing: {
      input: 0.59,
      output: 0.79,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Meta Llama 3 70B 提供无与伦比的复杂性处理能力，为高要求项目量身定制。',
    displayName: 'Llama 3 70B',
    id: 'llama3-70b-8192',
    pricing: {
      input: 0.59,
      output: 0.79,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Meta Llama 3 8B 带来优质的推理效能，适合多场景应用需求。',
    displayName: 'Llama 3 8B',
    id: 'llama3-8b-8192',
    pricing: {
      input: 0.05,
      output: 0.08,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    displayName: 'Mixtral Saba 24B',
    id: 'mistral-saba-24b',
    pricing: {
      input: 0.79,
      output: 0.79,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: 'Mixtral 8x7B 提供高容错的并行计算能力，适合复杂任务。',
    displayName: 'Mixtral 8x7B Instruct',
    id: 'mixtral-8x7b-32768',
    pricing: {
      input: 0.24,
      output: 0.24,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'Qwen 2.5 32B',
    id: 'qwen-2.5-32b',
    pricing: {
      input: 0.79,
      output: 0.79,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    displayName: 'Qwen 2.5 Coder 32B',
    id: 'qwen-2.5-coder-32b',
    pricing: {
      input: 0.79,
      output: 0.79,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    displayName: 'Llama Guard 3 8B',
    id: 'llama-guard-3-8b',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
];

export const allModels = [...groqChatModels];

export default allModels;
