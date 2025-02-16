import { AIChatModelCard, AIRealtimeModelCard } from '@/types/aiModel';

const doubaoChatModels: (AIChatModelCard | AIRealtimeModelCard)[] = [
  {
    contextWindowTokens: 131_072,
    description:
      'Doubao-1.5-pro，全新一代主力模型，性能全面升级，在知识、代码、推理、等方面表现卓越。',
    displayName: 'doubao-1.5-pro-256k',
    enabled: true,
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
    contextWindowTokens: 32_768,
    description:
      'Doubao-1.5-pro，全新一代主力模型，性能全面升级，在知识、代码、推理、等方面表现卓越。',
    displayName: 'doubao-1.5-pro-32k',
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
    contextWindowTokens: 32_768,
    description:
      'Doubao-1.5-vision-pro，全新升级的多模态大模型，支持任意分辨率和极端长宽比图像识别，增强视觉推理、文档识别、细节信息理解和指令遵循能力。',
    displayName: 'doubao-1.5-vision-pro-32k',
    enabled: true,
    id: 'doubao-1.5-vision-pro-32k',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      input: 3,
      output: 9,
    },
    type: 'realtime',
  },
  {
    contextWindowTokens: 64_000,
    description:
      'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。在数学、代码、自然语言推理等任务上，性能比肩 OpenAI o1 正式版。',
    displayName: 'deepseek-r1',
    enabled: true,
    id: 'deepseek-r1',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 64_000,
    description:
      'DeepSeek-V3 多项评测成绩超越了 Qwen2.5-72B 和 Llama-3.1-405B 等其他开源模型，并在性能上和世界顶尖的闭源模型 GPT-4o 以及 Claude-3.5-Sonnet 不分伯仲。',
    displayName: 'deepseek-v3',
    enabled: true,
    id: 'deepseek-v3',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '',
    displayName: '方舟自定义模型',
    enabled: true,
    id: 'ark-custom-model',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 4k 上下文窗口的推理和精调。',
    displayName: 'Doubao-lite-4k',
    enabled: true,
    id: 'Doubao-lite-4k',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao-lite-32k',
    enabled: true,
    id: 'Doubao-lite-32k',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 128k 上下文窗口的推理和精调。',
    displayName: 'Doubao-lite-128k',
    enabled: true,
    id: 'Doubao-lite-128k',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 4k 上下文窗口的推理和精调。',
    displayName: 'Doubao-pro-4k',
    enabled: true,
    id: 'Doubao-pro-4k',
    type: 'chat',
  },
  {
    config: {
      deploymentName: 'Doubao-pro-test',
    },
    contextWindowTokens: 32_768,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao-pro-32k',
    enabled: true,
    id: 'Doubao-pro-32k',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 128k 上下文窗口的推理和精调。',
    displayName: 'Doubao-pro-128k',
    enabled: true,
    id: 'Doubao-pro-128k',
    type: 'chat',
  },
];

export const allModels = [...doubaoChatModels];

export default allModels;
