import { AIChatModelCard } from '@/types/aiModel';

const doubaoChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 4k 上下文窗口的推理和精调。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一款由深度求索公司自研的MoE模型。DeepSeek-V3 多项评测成绩超越了 Qwen2.5-72B 和 Llama-3.1-405B 等其他开源模型，并在性能上和世界顶尖的闭源模型 GPT-4o 以及 Claude-3.5-Sonnet 不分伯仲。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-v3',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 4k 上下文窗口的推理和精调。',
    displayName: 'Doubao Lite 4k',
    id: 'Doubao-lite-4k',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 32k 上下文窗口的推理和精调。',
    displayName: 'Doubao Lite 32k',
    id: 'Doubao-lite-32k',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '拥有极致的响应速度，更好的性价比，为客户不同场景提供更灵活的选择。支持 128k 上下文窗口的推理和精调。',
    displayName: 'Doubao Lite 128k',
    id: 'Doubao-lite-128k',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 4k 上下文窗口的推理和精调。',
    displayName: 'Doubao Pro 4k',
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
    displayName: 'Doubao Pro 32k',
    id: 'Doubao-pro-32k',
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '效果最好的主力模型，适合处理复杂任务，在参考问答、总结摘要、创作、文本分类、角色扮演等场景都有很好的效果。支持 128k 上下文窗口的推理和精调。',
    displayName: 'Doubao Pro 128k',
    id: 'Doubao-pro-128k',
    type: 'chat',
  },
];

export const allModels = [...doubaoChatModels];

export default allModels;
