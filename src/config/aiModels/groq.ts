import { AIChatModelCard } from '@/types/aiModel';

// https://groq.com/pricing/
// https://console.groq.com/docs/models

const groqChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 131_072,
    description:
      'Compound-beta 是一个复合 AI 系统，由 GroqCloud 中已经支持的多个开放可用的模型提供支持，可以智能地、有选择地使用工具来回答用户查询。',
    displayName: 'Compound Beta',
    enabled: true,
    id: 'compound-beta',
    maxOutput: 8192,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Compound-beta-mini 是一个复合 AI 系统，由 GroqCloud 中已经支持的公开可用模型提供支持，可以智能地、有选择地使用工具来回答用户查询。',
    displayName: 'Compound Beta Mini',
    id: 'compound-beta-mini',
    maxOutput: 8192,
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    displayName: 'Llama 4 Scout (17Bx16E)',
    enabled: true,
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    maxOutput: 8192,
    pricing: {
      input: 0.11,
      output: 0.34,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    displayName: 'Llama 4 Maverick (17Bx128E)',
    enabled: true,
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    maxOutput: 8192,
    pricing: {
      input: 0.5,
      output: 0.77,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    displayName: 'Qwen QwQ 32B',
    enabled: true,
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
    description:
      'Llama 3.1 8B 是一款高效能模型，提供了快速的文本生成能力，非常适合需要大规模效率和成本效益的应用场景。',
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
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Meta Llama 3.3 多语言大语言模型 ( LLM ) 是 70B（文本输入/文本输出）中的预训练和指令调整生成模型。 Llama 3.3 指令调整的纯文本模型针对多语言对话用例进行了优化，并且在常见行业基准上优于许多可用的开源和封闭式聊天模型。',
    displayName: 'Llama 3.3 70B Versatile',
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
    contextWindowTokens: 131_072,
    displayName: 'Llama Guard 4 12B',
    id: 'meta-llama/Llama-Guard-4-12B',
    maxOutput: 128,
    pricing: {
      input: 0.2,
      output: 0.2,
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
  {
    contextWindowTokens: 4096,
    displayName: 'ALLaM 2 7B',
    id: 'allam-2-7b',
    type: 'chat',
  },
];

export const allModels = [...groqChatModels];

export default allModels;
