import { AIChatModelCard } from '@/types/aiModel';

const cohereChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 256_000,
    description:
      'Command A 是我们迄今为止性能最强的模型，在工具使用、代理、检索增强生成（RAG）和多语言应用场景方面表现出色。Command A 具有 256K 的上下文长度，仅需两块 GPU 即可运行，并且相比于 Command R+ 08-2024，吞吐量提高了 150%。',
    displayName: 'Command A 2503',
    enabled: true,
    id: 'command-a-03-2025',
    maxOutput: 8000,
    pricing: {
      input: 2.5,
      output: 10
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'command-r-plus 是 command-r-plus-04-2024 的别名，因此如果您在 API 中使用 command-r-plus，实际上指向的就是该模型。',
    displayName: 'Command R+ 2404',
    id: 'command-r-plus-04-2024',
    maxOutput: 4000,
    pricing: {
      input: 3,
      output: 15
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Command R+ 是一个遵循指令的对话模型，在语言任务方面表现出更高的质量、更可靠，并且相比以往模型具有更长的上下文长度。它最适用于复杂的 RAG 工作流和多步工具使用。',
    displayName: 'Command R+ 2408',
    enabled: true,
    id: 'command-r-plus-08-2024',
    maxOutput: 4000,
    pricing: {
      input: 2.5,
      output: 10
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'command-r 是一种遵循指令的会话模型，与以前的模型相比，它以更高的质量、更可靠的方式和更长的上下文执行语言任务。它可用于复杂的工作流程，如代码生成、检索增强生成（RAG）、工具使用和代理。',
    displayName: 'Command R 2403',
    id: 'command-r-03-2024',
    maxOutput: 4000,
    pricing: {
      input: 0.15,
      output: 0.6
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'command-r-08-2024 是 Command R 模型的更新版本，于 2024 年 8 月发布。',
    displayName: 'Command R 2408',
    enabled: true,
    id: 'command-r-08-2024',
    maxOutput: 4000,
    pricing: {
      input: 0.15,
      output: 0.6
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'Command R 是一个遵循指令的对话模型，在语言任务方面表现出更高的质量、更可靠，并且相比以往模型具有更长的上下文长度。它可用于复杂的工作流程，如代码生成、检索增强生成（RAG）、工具使用和代理。',
    displayName: 'Command R 2403',
    id: 'command-r-03-2024',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      'command-r7b-12-2024 是一个小型且高效的更新版本，于 2024 年 12 月发布。它在 RAG、工具使用、代理等需要复杂推理和多步处理的任务中表现出色。',
    displayName: 'Command R7B 2412',
    id: 'command-r7b-12-2024',
    maxOutput: 4000,
    pricing: {
      input: 0.0375,
      output: 0.15
    },
    type: 'chat'
  },
  {
    contextWindowTokens: 4000,
    description:
      '一个遵循指令的对话模型，在语言任务中表现出高质量、更可靠，并且相比我们的基础生成模型具有更长的上下文长度。',
    displayName: 'Command',
    id: 'command',
    maxOutput: 4000,
    pricing: {
      input: 1,
      output: 2
    },
    type: 'chat'
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      '为了缩短主要版本发布之间的时间间隔，我们推出了 Command 模型的每夜版本。对于 Command 系列，这一版本称为 command-cightly。请注意，command-nightly 是最新、最具实验性且（可能）不稳定的版本。每夜版本会定期更新，且不会提前通知，因此不建议在生产环境中使用。',
    displayName: 'Command Nightly',
    id: 'command-nightly',
    maxOutput: 4000,
    pricing: {
      input: 1,
      output: 2
    },
    type: 'chat'
  },
  {
    contextWindowTokens: 4000,
    description:
      '一个更小、更快的 Command 版本，几乎同样强大，但速度更快。',
    displayName: 'Command Light',
    id: 'command-light',
    maxOutput: 4000,
    pricing: {
      input: 0.3,
      output: 0.6
    },
    type: 'chat'
  },
  {
    contextWindowTokens: 4000,
    description:
      '为了缩短主要版本发布之间的时间间隔，我们推出了 Command 模型的每夜版本。对于 command-light 系列，这一版本称为 command-light-nightly。请注意，command-light-nightly 是最新、最具实验性且（可能）不稳定的版本。每夜版本会定期更新，且不会提前通知，因此不建议在生产环境中使用。',
    displayName: 'Command Light Nightly',
    id: 'command-light-nightly',
    maxOutput: 4000,
    pricing: {
      input: 0.3,
      output: 0.6
    },
    type: 'chat'
  },
  {
    contextWindowTokens: 128_000,
    description:
      'Aya Expanse 是一款高性能的 32B 多语言模型，旨在通过指令调优、数据套利、偏好训练和模型合并的创新，挑战单语言模型的表现。它支持 23 种语言。',
    displayName: 'Aya Expanse 32B',
    enabled: true,
    id: 'c4ai-aya-expanse-32b',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
  {
    contextWindowTokens: 8000,
    description:
      'Aya Expanse 是一款高性能的 8B 多语言模型，旨在通过指令调优、数据套利、偏好训练和模型合并的创新，挑战单语言模型的表现。它支持 23 种语言。',
    displayName: 'Aya Expanse 8B',
    enabled: true,
    id: 'c4ai-aya-expanse-8b',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_000,
    description:
      'Aya Vision 是一款最先进的多模态模型，在语言、文本和图像能力的多个关键基准上表现出色。它支持 23 种语言。这个 320 亿参数的版本专注于最先进的多语言表现。',
    displayName: 'Aya Vision 32B',
    enabled: true,
    id: 'c4ai-aya-vision-32b',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_000,
    description:
      'Aya Vision 是一款最先进的多模态模型，在语言、文本和图像能力的多个关键基准上表现出色。这个 80 亿参数的版本专注于低延迟和最佳性能。',
    displayName: 'Aya Vision 8B',
    enabled: true,
    id: 'c4ai-aya-vision-8b',
    maxOutput: 4000,
    pricing: {
      input: 0.5,
      output: 1.5
    },
    type: 'chat'
  },
]

export const allModels = [...cohereChatModels];

export default allModels;
