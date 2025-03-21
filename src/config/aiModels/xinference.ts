import { AIChatModelCard } from '@/types/aiModel';

const xinferenceChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek-V3, a strong Mixture-of-Experts (MoE) language model with 671B total parameters with 37B activated for each token.',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-v3',
    type: 'chat'
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 163_840,
    description:
      'DeepSeek-R1, which incorporates cold-start data before RL. DeepSeek-R1 achieves performance comparable to OpenAI-o1 across math, code, and reasoning tasks.',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    type: 'chat'
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'deepseek-r1-distill-llama is distilled from DeepSeek-R1 based on Llama',
    displayName: 'DeepSeek R1 Distill Llama',
    enabled: true,
    id: 'deepseek-r1-distill-llama',
    type: 'chat'
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'deepseek-r1-distill-qwen is distilled from DeepSeek-R1 based on Qwen',
    displayName: 'DeepSeek R1 Distill Qwen',
    enabled: true,
    id: 'deepseek-r1-distill-qwen',
    type: 'chat'
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'QwQ is the reasoning model of the Qwen series. Compared with conventional instruction-tuned models, QwQ, which is capable of thinking and reasoning, can achieve significantly enhanced performance in downstream tasks, especially hard problems. QwQ-32B is the medium-sized reasoning model, which is capable of achieving competitive performance against state-of-the-art reasoning models, e.g., DeepSeek-R1, o1-mini.',
    displayName: 'QwQ 32B',
    enabled: true,
    id: 'qwq-32b',
    type: 'chat'
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'QVQ-72B-Preview is an experimental research model developed by the Qwen team, focusing on enhancing visual reasoning capabilities.',
    displayName: 'QVQ 72B Preview',
    enabled: true,
    id: 'qvq-72b-preview',
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32768,
    description:
      'Qwen2.5 is the latest series of Qwen large language models. For Qwen2.5, we release a number of base language models and instruction-tuned language models ranging from 0.5 to 72 billion parameters.',
    displayName: 'Qwen2.5 Instruct',
    enabled: true,
    id: 'qwen2.5-instruct',
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5-Coder is the latest series of Code-Specific Qwen large language models (formerly known as CodeQwen).',
    displayName: 'Qwen2.5 Coder Instruct',
    enabled: true,
    id: 'qwen2.5-coder-instruct',
    type: 'chat'
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Qwen2.5-VL: Qwen2.5-VL is the latest version of the vision language models in the Qwen model familities.',
    displayName: 'Qwen2.5 VL Instruct',
    enabled: true,
    id: 'qwen2.5-vl-instruct',
    type: 'chat'
  },
  {
    contextWindowTokens: 1_024_000,
    description:
      'The Mistral-Nemo-Instruct-2407 Large Language Model (LLM) is an instruct fine-tuned version of the Mistral-Nemo-Base-2407',
    displayName: 'Mistral Nemo Instruct',
    enabled: true,
    id: 'mistral-nemo-instruct',
    type: 'chat'
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Mistral-Large-Instruct-2407 is an advanced dense Large Language Model (LLM) of 123B parameters with state-of-the-art reasoning, knowledge and coding capabilities.',
    displayName: 'Mistral Large Instruct',
    enabled: true,
    id: 'mistral-large-instruct',
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'The Llama 3.3 instruction tuned models are optimized for dialogue use cases and outperform many of the available open source chat models on common industry benchmarks.',
    displayName: 'Llama 3.3 Instruct',
    enabled: true,
    id: 'llama-3.3-instruct',
    type: 'chat'
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 163_840,
    description:
      'Llama 3.2-Vision instruction-tuned models are optimized for visual recognition, image reasoning, captioning, and answering general questions about an image.',
    displayName: 'Llama 3.2 Vision Instruct',
    enabled: true,
    id: 'llama-3.2-vision-instruct',
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      'The Llama 3.1 instruction tuned models are optimized for dialogue use cases and outperform many of the available open source chat models on common industry benchmarks.',
    displayName: 'Llama 3.1 Instruct',
    enabled: true,
    id: 'llama-3.1-instruct',
    type: 'chat'
  },
]

export const allModels = [...xinferenceChatModels];

export default allModels;
