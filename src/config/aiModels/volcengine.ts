import { AIChatModelCard } from '@/types/aiModel';

// modelInfo https://www.volcengine.com/docs/82379/1330310
// pricing https://console.volcengine.com/ark/region:ark+cn-beijing/openManagement

const doubaoChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    config: {
      deploymentName: 'doubao-1-5-thinking-pro-250415',
    },
    contextWindowTokens: 128_000,
    description:
      'Doubao-1.5全新深度思考模型，在数学、编程、科学推理等专业领域及创意写作等通用任务中表现突出，在AIME 2024、Codeforces、GPQA等多项权威基准上达到或接近业界第一梯队水平。支持128k上下文窗口，16k输出。',
    displayName: 'Doubao 1.5 Thinking Pro',
    enabled: true,
    id: 'Doubao-1.5-thinking-pro',
    maxOutput: 16_000,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      vision: true,
    },
    config: {
      deploymentName: 'doubao-1-5-thinking-pro-vision-250415',
    },
    contextWindowTokens: 128_000,
    description:
      'Doubao-1.5全新深度思考模型，在数学、编程、科学推理等专业领域及创意写作等通用任务中表现突出，在AIME 2024、Codeforces、GPQA等多项权威基准上达到或接近业界第一梯队水平。支持128k上下文窗口，16k输出。',
    displayName: 'Doubao 1.5 Thinking Pro Vision',
    enabled: true,
    id: 'Doubao-1.5-thinking-pro-vision',
    maxOutput: 16_000,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    config: {
      deploymentName: 'deepseek-r1-250120',
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。在数学、代码、自然语言推理等任务上，性能比肩 OpenAI o1 正式版。',
    displayName: 'DeepSeek R1',
    id: 'deepseek-r1',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    config: {
      deploymentName: 'deepseek-r1-distill-qwen-32b-250120',
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill 模型是在开源模型的基础上通过微调训练得到的，训练过程中使用了由 DeepSeek-R1 生成的样本数据。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'deepseek-r1-distill-qwen-32b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      input: 1.5,
      output: 6,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    config: {
      deploymentName: 'deepseek-r1-distill-qwen-7b-250120',
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill 模型是在开源模型的基础上通过微调训练得到的，训练过程中使用了由 DeepSeek-R1 生成的样本数据。',
    displayName: 'DeepSeek R1 Distill Qwen 7B',
    id: 'deepseek-r1-distill-qwen-7b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      input: 0.6,
      output: 2.4,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    config: {
      deploymentName: 'deepseek-v3-250324',
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一款由深度求索公司自研的MoE模型。DeepSeek-V3 多项评测成绩超越了 Qwen2.5-72B 和 Llama-3.1-405B 等其他开源模型，并在性能上和世界顶尖的闭源模型 GPT-4o 以及 Claude-3.5-Sonnet 不分伯仲。',
    displayName: 'DeepSeek V3',
    id: 'deepseek-v3',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    config: {
      deploymentName: 'doubao-1-5-pro-32k-250115',
    },
    contextWindowTokens: 32_768,
    description:
      'Doubao-1.5-pro 全新一代主力模型，性能全面升级，在知识、代码、推理、等方面表现卓越。',
    displayName: 'Doubao 1.5 Pro 32k',
    enabled: true,
    id: 'doubao-1.5-pro-32k',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    type: 'chat',
  },
  {
    config: {
      deploymentName: 'doubao-1-5-pro-256k-250115',
    },
    contextWindowTokens: 256_000,
    description:
      'Doubao-1.5-pro-256k 基于 Doubao-1.5-Pro 全面升级版，整体效果大幅提升 10%。支持 256k 上下文窗口的推理，输出长度支持最大 12k tokens。更高性能、更大窗口、超高性价比，适用于更广泛的应用场景。',
    displayName: 'Doubao 1.5 Pro 256k',
    id: 'doubao-1.5-pro-256k',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 9,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    config: {
      deploymentName: 'doubao-1-5-lite-32k-250115',
    },
    contextWindowTokens: 32_768,
    description:
      'Doubao-1.5-lite 全新一代轻量版模型，极致响应速度，效果与时延均达到全球一流水平。',
    displayName: 'Doubao 1.5 Lite 32k',
    enabled: true,
    id: 'doubao-1.5-lite-32k',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      input: 0.3,
      output: 0.6,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    config: {
      deploymentName: 'doubao-1-5-vision-pro-32k-250115',
    },
    contextWindowTokens: 32_768,
    description:
      'Doubao-1.5-vision-pro 全新升级的多模态大模型，支持任意分辨率和极端长宽比图像识别，增强视觉推理、文档识别、细节信息理解和指令遵循能力。',
    displayName: 'Doubao 1.5 Vision Pro 32k',
    id: 'Doubao-1.5-vision-pro-32k',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      input: 3,
      output: 9,
    },
    releasedAt: '2025-01-15',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    config: {
      deploymentName: 'doubao-1-5-vision-pro-250328',
    },
    contextWindowTokens: 128_000,
    description:
      'Doubao-1.5-vision-pro 全新升级的多模态大模型，支持任意分辨率和极端长宽比图像识别，增强视觉推理、文档识别、细节信息理解和指令遵循能力。',
    displayName: 'Doubao 1.5 Vision Pro',
    id: 'Doubao-1.5-vision-pro',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      input: 3,
      output: 9,
    },
    releasedAt: '2025-03-28',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    config: {
      deploymentName: 'doubao-1-5-vision-lite-250315',
    },
    contextWindowTokens: 128_000,
    description:
      'Doubao-1.5-vision-lite 全新升级的多模态大模型，支持任意分辨率和极端长宽比图像识别，增强视觉推理、文档识别、细节信息理解和指令遵循能力。支持 128k 上下文窗口，输出长度支持最大 16k tokens。',
    displayName: 'Doubao 1.5 Vision Lite',
    id: 'doubao-1.5-vision-lite',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      input: 1.5,
      output: 4.5,
    },
    releasedAt: '2025-03-15',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    config: {
      deploymentName: 'doubao-vision-pro-32k-241028',
    },
    contextWindowTokens: 32_768,
    description:
      'Doubao-vision 模型是豆包推出的多模态大模型，具备强大的图片理解与推理能力，以及精准的指令理解能力。模型在图像文本信息抽取、基于图像的推理任务上有展现出了强大的性能，能够应用于更复杂、更广泛的视觉问答任务。',
    displayName: 'Doubao Vision Pro 32k',
    id: 'Doubao-vision-pro-32k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 3,
      output: 9,
    },
    releasedAt: '2024-10-28',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    config: {
      deploymentName: 'doubao-vision-lite-32k-241015',
    },
    contextWindowTokens: 32_768,
    description:
      'Doubao-vision 模型是豆包推出的多模态大模型，具备强大的图片理解与推理能力，以及精准的指令理解能力。模型在图像文本信息抽取、基于图像的推理任务上有展现出了强大的性能，能够应用于更复杂、更广泛的视觉问答任务。',
    displayName: 'Doubao Vision Lite 32k',
    id: 'Doubao-vision-lite-32k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 1.5,
      output: 4.5,
    },
    releasedAt: '2024-10-15',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 4k 上下文窗口的推理和精调。',
    displayName: 'Doubao Lite 4k',
    id: 'Doubao-lite-4k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 0.3,
      output: 0.6,
    },
    type: 'chat',
  },
  {
    config: {
      deploymentName: 'doubao-lite-32k-240828',
    },
    contextWindowTokens: 32_768,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao Lite 32k',
    id: 'Doubao-lite-32k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 0.3,
      output: 0.6,
    },
    type: 'chat',
  },
  {
    config: {
      deploymentName: 'doubao-lite-128k-240828',
    },
    contextWindowTokens: 128_000,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 128k 上下文窗口的推理和精调。',
    displayName: 'Doubao Lite 128k',
    id: 'Doubao-lite-128k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 1,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 4k 上下文窗口的推理和精调。',
    displayName: 'Doubao Pro 4k',
    id: 'Doubao-pro-4k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    type: 'chat',
  },
  {
    config: {
      deploymentName: 'doubao-pro-32k-241215',
    },
    contextWindowTokens: 32_768,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao Pro 32k',
    id: 'Doubao-pro-32k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 128k 上下文窗口的推理和精调。',
    displayName: 'Doubao Pro 128k',
    id: 'Doubao-pro-128k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 9,
    },
    type: 'chat',
  },
  {
    config: {
      deploymentName: 'doubao-pro-256k-241115',
    },
    contextWindowTokens: 256_000,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 256k 上下文窗口的推理和精调。',
    displayName: 'Doubao Pro 256k',
    id: 'Doubao-pro-256k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 9,
    },
    type: 'chat',
  },
];

export const allModels = [...doubaoChatModels];

export default allModels;
