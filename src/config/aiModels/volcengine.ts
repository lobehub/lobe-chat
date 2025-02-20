import { AIChatModelCard } from '@/types/aiModel';

// modelInfo https://www.volcengine.com/docs/82379/1330310
// pricing https://www.volcengine.com/docs/82379/1099320

const doubaoChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    config: {
      deploymentName: 'deepseek-r1-250120',
    },
    contextWindowTokens: 65_536,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 4k 上下文窗口的推理和精调。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    max_tokens: 8000,
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
      deploymentName: 'deepseek-v3-241226',
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一款由深度求索公司自研的MoE模型。DeepSeek-V3 多项评测成绩超越了 Qwen2.5-72B 和 Llama-3.1-405B 等其他开源模型，并在性能上和世界顶尖的闭源模型 GPT-4o 以及 Claude-3.5-Sonnet 不分伯仲。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-v3',
    max_tokens: 8000,
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    config: {
      deploymentName: 'doubao-1-5-vision-pro-32k-250115',
    },
    contextWindowTokens: 32_768,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao 1.5 Vision Pro 32k',
    id: 'Doubao-1.5-vision-pro-32k',
    max_tokens: 12_000,
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
      vision: true,
    },
    config: {
      deploymentName: 'doubao-vision-pro-32k-241028',
    },
    contextWindowTokens: 32_768,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao Vision Pro 32k',
    id: 'Doubao-vision-pro-32k',
    max_tokens: 4096,
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
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao Vision Lite 32k',
    id: 'Doubao-vision-lite-32k',
    max_tokens: 4096,
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
    max_tokens: 4096,
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
    max_tokens: 4096,
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
    max_tokens: 4096,
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
    max_tokens: 4096,
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
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao Pro 32k',
    id: 'Doubao-pro-32k',
    max_tokens: 4096,
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
    max_tokens: 4096,
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 9,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 256_000,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 128k 上下文窗口的推理和精调。',
    displayName: 'Doubao Pro 256k',
    id: 'Doubao-pro-256k',
    max_tokens: 4096,
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
