import { AIChatModelCard } from '@/types/aiModel';

const fireworksaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 8192,
    description:
      'Fireworks 公司最新推出的 Firefunction-v2 是一款性能卓越的函数调用模型，基于 Llama-3 开发，并通过大量优化，特别适用于函数调用、对话及指令跟随等场景。',
    displayName: 'Firefunction V2',
    enabled: true,
    id: 'accounts/fireworks/models/firefunction-v2',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: 'Fireworks 开源函数调用模型，提供卓越的指令执行能力和开放可定制的特性。',
    displayName: 'Firefunction V1',
    id: 'accounts/fireworks/models/firefunction-v1',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description:
      'fireworks-ai/FireLLaVA-13b 是一款视觉语言模型，可以同时接收图像和文本输入，经过高质量数据训练，适合多模态任务。',
    displayName: 'FireLLaVA-13B',
    enabled: true,
    id: 'accounts/fireworks/models/firellava-13b',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.2 1B 指令模型是Meta推出的一款轻量级多语言模型。该模型旨在提高效率，与更大型的模型相比，在延迟和成本方面提供了显著的改进。该模型的示例用例包括检索和摘要。',
    displayName: 'Llama 3.2 1B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p2-1b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.2 3B 指令模型是Meta推出的一款轻量级多语言模型。该模型旨在提高效率，与更大型的模型相比，在延迟和成本方面提供了显著的改进。该模型的示例用例包括查询和提示重写以及写作辅助。',
    displayName: 'Llama 3.2 3B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p2-3b-instruct',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Meta的11B参数指令调整图像推理模型。该模型针对视觉识别、图像推理、图像描述和回答关于图像的一般性问题进行了优化。该模型能够理解视觉数据，如图表和图形，并通过生成文本描述图像细节来弥合视觉与语言之间的差距。',
    displayName: 'Llama 3.2 11B Vision Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p2-11b-vision-instruct',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Meta的90B参数指令调整图像推理模型。该模型针对视觉识别、图像推理、图像描述和回答关于图像的一般性问题进行了优化。该模型能够理解视觉数据，如图表和图形，并通过生成文本描述图像细节来弥合视觉与语言之间的差距。',
    displayName: 'Llama 3.2 90B Vision Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p2-90b-vision-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.1 8B 指令模型，专为多语言对话优化，能够在常见行业基准上超越多数开源及闭源模型。',
    displayName: 'Llama 3.1 8B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p1-8b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.1 70B 指令模型，提供卓越的自然语言理解和生成能力，是对话及分析任务的理想选择。',
    displayName: 'Llama 3.1 70B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Llama 3.1 405B 指令模型，具备超大规模参数，适合复杂任务和高负载场景下的指令跟随。',
    displayName: 'Llama 3.1 405B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/llama-v3p1-405b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Llama 3 8B 指令模型，优化用于对话及多语言任务，表现卓越且高效。',
    displayName: 'Llama 3 8B Instruct',
    id: 'accounts/fireworks/models/llama-v3-8b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Llama 3 70B 指令模型，专为多语言对话和自然语言理解优化，性能优于多数竞争模型。',
    displayName: 'Llama 3 70B Instruct',
    id: 'accounts/fireworks/models/llama-v3-70b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Llama 3 8B 指令模型（HF 版本），与官方实现结果一致，具备高度一致性和跨平台兼容性。',
    displayName: 'Llama 3 8B Instruct (HF version)',
    id: 'accounts/fireworks/models/llama-v3-8b-instruct-hf',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'Llama 3 70B 指令模型（HF 版本），与官方实现结果保持一致，适合高质量的指令跟随任务。',
    displayName: 'Llama 3 70B Instruct (HF version)',
    id: 'accounts/fireworks/models/llama-v3-70b-instruct-hf',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Mixtral MoE 8x7B 指令模型，多专家架构提供高效的指令跟随及执行。',
    displayName: 'Mixtral MoE 8x7B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/mixtral-8x7b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 65_536,
    description:
      'Mixtral MoE 8x22B 指令模型，大规模参数和多专家架构，全方位支持复杂任务的高效处理。',
    displayName: 'Mixtral MoE 8x22B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/mixtral-8x22b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Mixtral MoE 8x7B 指令模型（HF 版本），性能与官方实现一致，适合多种高效任务场景。',
    displayName: 'Mixtral MoE 8x7B Instruct (HF version)',
    id: 'accounts/fireworks/models/mixtral-8x7b-instruct-hf',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_064,
    description:
      'Phi-3-Vision-128K-Instruct 是一个轻量级的、最先进的开放多模态模型，它基于包括合成数据和经过筛选的公开网站在内的数据集构建，专注于非常高质量、推理密集型的数据，这些数据既包括文本也包括视觉。该模型属于 Phi-3 模型系列，其多模态版本支持 128K 的上下文长度（以标记为单位）。该模型经过严格的增强过程，结合了监督微调和直接偏好优化，以确保精确遵循指令和强大的安全措施。',
    displayName: 'Phi 3.5 Vision Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/phi-3-vision-128k-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'QwQ模型是由 Qwen 团队开发的实验性研究模型，专注于增强 AI 推理能力。',
    displayName: 'QwQ 32B Preview',
    enabled: true,
    id: 'accounts/fireworks/models/qwen-qwq-32b-preview',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5 是由阿里云 Qwen 团队开发的一系列仅包含解码器的语言模型。这些模型提供不同的大小，包括 0.5B、1.5B、3B、7B、14B、32B 和 72B，并且有基础版（base）和指令版（instruct）两种变体。',
    displayName: 'Qwen2.5 72B Instruct',
    enabled: true,
    id: 'accounts/fireworks/models/qwen2p5-72b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'Qwen2.5 Coder 32B Instruct 是阿里云发布的代码特定大语言模型系列的最新版本。该模型在 Qwen2.5 的基础上，通过 5.5 万亿个 tokens 的训练，显著提升了代码生成、推理和修复能力。它不仅增强了编码能力，还保持了数学和通用能力的优势。模型为代码智能体等实际应用提供了更全面的基础',
    displayName: 'Qwen2.5 Coder 32B Instruct',
    enabled: false,
    id: 'accounts/fireworks/models/qwen2p5-coder-32b-instruct',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Yi-Large 模型，具备卓越的多语言处理能力，可用于各类语言生成和理解任务。',
    displayName: 'Yi-Large',
    enabled: true,
    id: 'accounts/yi-01-ai/models/yi-large',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'StarCoder 7B 模型，针对80多种编程语言训练，拥有出色的编程填充能力和语境理解。',
    displayName: 'StarCoder 7B',
    id: 'accounts/fireworks/models/starcoder-7b',
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'StarCoder 15.5B 模型，支持高级编程任务，多语言能力增强，适合复杂代码生成和理解。',
    displayName: 'StarCoder 15.5B',
    id: 'accounts/fireworks/models/starcoder-16b',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: 'MythoMax L2 13B 模型，结合新颖的合并技术，擅长叙事和角色扮演。',
    displayName: 'MythoMax L2 13b',
    id: 'accounts/fireworks/models/mythomax-l2-13b',
    type: 'chat',
  },
];

export const allModels = [...fireworksaiChatModels];

export default allModels;
