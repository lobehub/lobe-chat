import { AIChatModelCard } from '../types/aiModel';

const zerooneChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 16_384,
    description: '最新高性能模型，保证高质量输出同时，推理速度大幅提升。',
    displayName: 'Yi Lightning',
    enabled: true,
    id: 'yi-lightning',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_384,
    description: '复杂视觉任务模型，提供基于多张图片的高性能理解、分析能力。',
    displayName: 'Yi Vision V2',
    enabled: true,
    id: 'yi-vision-v2',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description: '小而精悍，轻量极速模型。提供强化数学运算和代码编写能力。',
    displayName: 'Yi Spark',
    id: 'yi-spark',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description: '中型尺寸模型升级微调，能力均衡，性价比高。深度优化指令遵循能力。',
    displayName: 'Yi Medium',
    id: 'yi-medium',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 200_000,
    description: '200K 超长上下文窗口，提供长文本深度理解和生成能力。',
    displayName: 'Yi Medium 200K',
    id: 'yi-medium-200k',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description: '超高性价比、卓越性能。根据性能和推理速度、成本，进行平衡性高精度调优。',
    displayName: 'Yi Large Turbo',
    id: 'yi-large-turbo',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description:
      '基于 yi-large 超强模型的高阶服务，结合检索与生成技术提供精准答案，实时全网检索信息服务。',
    displayName: 'Yi Large RAG',
    id: 'yi-large-rag',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 25, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      '在 yi-large 模型的基础上支持并强化了工具调用的能力，适用于各种需要搭建 agent 或 workflow 的业务场景。',
    displayName: 'Yi Large FC',
    id: 'yi-large-fc',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '全新千亿参数模型，提供超强问答及文本生成能力。',
    displayName: 'Yi Large',
    id: 'yi-large',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_384,
    description: '复杂视觉任务模型，提供高性能图片理解、分析能力。',
    displayName: 'Yi Vision',
    id: 'yi-vision',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description: '初期版本，推荐使用 yi-large（新版本）。',
    displayName: 'Yi Large Preview',
    id: 'yi-large-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 16_384,
    description: '轻量化版本，推荐使用 yi-lightning。',
    displayName: 'Yi Lightning Lite',
    id: 'yi-lightning-lite',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...zerooneChatModels];

export default allModels;
