import { AIChatModelCard } from '@/types/aiModel';

// https://novita.ai/pricing
const novitaChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 131_072,
    displayName: 'Llama 4 Scout 17B Instruct',
    enabled: true,
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    pricing: {
      input: 0.1,
      output: 0.5,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 1_048_576,
    displayName: 'Llama 4 Maverick 17B Instruct',
    enabled: true,
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
    pricing: {
      input: 0.2,
      output: 0.85,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description: 'Llama 3.1 8B Instruct  优化了高质量对话场景，表现优于许多领先的闭源模型。',
    displayName: 'Llama 3.1 8B Instruct',
    id: 'meta-llama/llama-3.1-8b-instruct',
    pricing: {
      input: 0.02,
      output: 0.05,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Llama 3.1 70B Instruct 专为高质量对话而设计，在人类评估中表现突出，特别适合高交互场景。',
    displayName: 'Llama 3.1 70B Instruct',
    id: 'meta-llama/llama-3.1-70b-instruct',
    pricing: {
      input: 0.34,
      output: 0.39,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Llama 3 8B Instruct 优化了高质量对话场景，性能优于许多闭源模型。',
    displayName: 'Llama 3 8B Instruct',
    id: 'meta-llama/llama-3-8b-instruct',
    pricing: {
      input: 0.04,
      output: 0.04,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Llama 3 70B Instruct 优化用于高质量对话场景，在各类人类评估中表现优异。',
    displayName: 'Llama 3 70B Instruct',
    id: 'meta-llama/llama-3-70b-instruct',
    pricing: {
      input: 0.51,
      output: 0.74,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Gemma 2 9B 是谷歌的一款开源语言模型，以其在效率和性能方面设立了新的标准。',
    displayName: 'Gemma 2 9B',
    id: 'google/gemma-2-9b-it',
    pricing: {
      input: 0.08,
      output: 0.08,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description: 'Gemma 3 27B 是谷歌的一款开源语言模型，以其在效率和性能方面设立了新的标准。',
    displayName: 'Gemma 3 27B',
    id: 'google/gemma-3-27b-it',
    pricing: {
      input: 0.2,
      output: 0.2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'Mistral Nemo 是多语言支持和高性能编程的7.3B参数模型。',
    displayName: 'Mistral Nemo',
    id: 'mistralai/mistral-nemo',
    pricing: {
      input: 0.17,
      output: 0.17,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Mistral 7B Instruct 是一款兼有速度优化和长上下文支持的高性能行业标准模型。',
    displayName: 'Mistral 7B Instruct',
    id: 'mistralai/mistral-7b-instruct',
    pricing: {
      input: 0.059,
      output: 0.059,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 65_535,
    description: 'WizardLM-2 8x22B 是微软AI最先进的Wizard模型，显示出极其竞争力的表现。',
    displayName: 'WizardLM-2 8x22B',
    id: 'microsoft/wizardlm-2-8x22b',
    pricing: {
      input: 0.62,
      output: 0.62,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_000,
    description: 'Dolphin Mixtral 8x22B 是一款为指令遵循、对话和编程设计的模型。',
    displayName: 'Dolphin Mixtral 8x22B',
    id: 'cognitivecomputations/dolphin-mixtral-8x22b',
    pricing: {
      input: 0.9,
      output: 0.9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Hermes 2 Pro Llama 3 8B 是 Nous Hermes 2的升级版本，包含最新的内部开发的数据集。',
    displayName: 'Hermes 2 Pro Llama 3 8B',
    id: 'nousresearch/hermes-2-pro-llama-3-8b',
    pricing: {
      input: 0.14,
      output: 0.14,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: 'MythoMax l2 13B 是一款合并了多个顶尖模型的创意与智能相结合的语言模型。',
    displayName: 'MythoMax l2 13B',
    id: 'gryphe/mythomax-l2-13b',
    pricing: {
      input: 0.09,
      output: 0.09,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 64_000,
    displayName: 'Deepseek V3 Turbo',
    id: 'deepseek/deepseek-v3-turbo',
    pricing: {
      input: 0.4,
      output: 1.3,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 64_000,
    displayName: 'Deepseek R1 Turbo',
    enabled: true,
    id: 'deepseek/deepseek-r1-turbo',
    pricing: {
      input: 0.7,
      output: 2.5,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 64_000,
    displayName: 'Deepseek R1',
    id: 'deepseek/deepseek-r1',
    pricing: {
      input: 4,
      output: 4,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    displayName: 'Deepseek V3 0324',
    enabled: true,
    id: 'deepseek/deepseek-v3-0324',
    pricing: {
      input: 0.37,
      output: 1.3,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 64_000,
    displayName: 'Deepseek V3',
    id: 'deepseek/deepseek_v3',
    pricing: {
      input: 0.89,
      output: 0.89,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    displayName: 'Deepseek R1 Distill Llama 70B',
    id: 'deepseek/deepseek-r1-distill-llama-70b',
    pricing: {
      input: 0.8,
      output: 0.8,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 64_000,
    displayName: 'Deepseek R1 Distill Qwen 14B',
    id: 'deepseek/deepseek-r1-distill-qwen-14b',
    pricing: {
      input: 0.15,
      output: 0.15,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 64_000,
    displayName: 'Deepseek R1 Distill Qwen 32B',
    id: 'deepseek/deepseek-r1-distill-qwen-32b',
    pricing: {
      input: 0.3,
      output: 0.3,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    displayName: 'L3 8B Stheno v3.2',
    id: 'Sao10K/L3-8B-Stheno-v3.2',
    pricing: {
      input: 0.05,
      output: 0.05,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_000,
    displayName: 'Deepseek R1 Distill Llama 8B',
    id: 'deepseek/deepseek-r1-distill-llama-8b',
    pricing: {
      input: 0.04,
      output: 0.04,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    displayName: 'Qwen 2.5 72B Instruct',
    id: 'qwen/qwen-2.5-72b-instruct',
    pricing: {
      input: 0.38,
      output: 0.4,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_000,
    displayName: 'L3 70B Euryale v2.1',
    id: 'sao10k/l3-70b-euryale-v2.1',
    pricing: {
      input: 1.48,
      output: 1.48,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    displayName: 'Airoboros L2 70B',
    id: 'jondurbin/airoboros-l2-70b',
    pricing: {
      input: 0.5,
      output: 0.5,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    displayName: 'Midnight Rose 70B',
    id: 'sophosympatheia/midnight-rose-70b',
    pricing: {
      input: 0.8,
      output: 0.8,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    displayName: 'L3 8B Lunaris',
    id: 'sao10k/l3-8b-lunaris',
    pricing: {
      input: 0.05,
      output: 0.05,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 96_000,
    displayName: 'Qwen 2.5 VL 72B Instruct',
    enabled: true,
    id: 'qwen/qwen2.5-vl-72b-instruct',
    pricing: {
      input: 0.8,
      output: 0.8,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_000,
    displayName: 'Llama 3.2 1B Instruct',
    id: 'meta-llama/llama-3.2-1b-instruct',
    pricing: {
      input: 0.02,
      output: 0.02,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    displayName: 'Llama 3.2 11B Vision Instruct',
    id: 'meta-llama/llama-3.2-11b-vision-instruct',
    pricing: {
      input: 0.06,
      output: 0.06,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    displayName: 'Llama 3.2 3B Instruct',
    id: 'meta-llama/llama-3.2-3b-instruct',
    pricing: {
      input: 0.03,
      output: 0.05,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    displayName: 'Llama 3.1 8B Instruct BF16',
    id: 'meta-llama/llama-3.1-8b-instruct-bf16',
    pricing: {
      input: 0.06,
      output: 0.06,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    displayName: 'L31 70B Euryale v2.2',
    id: 'sao10k/l31-70b-euryale-v2.2',
    pricing: {
      input: 1.48,
      output: 1.48,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    displayName: 'QwQ 32B',
    enabled: true,
    id: 'qwen/qwq-32b',
    pricing: {
      input: 0.18,
      output: 0.2,
    },
    type: 'chat',
  },
];

export const allModels = [...novitaChatModels];

export default allModels;
