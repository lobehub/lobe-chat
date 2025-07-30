import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.lingyiwanwu.com/docs#%E6%A8%A1%E5%9E%8B%E4%B8%8E%E8%AE%A1%E8%B4%B9
const ZeroOne: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 16_384,
      description: '最新高性能模型，保证高质量输出同时，推理速度大幅提升。',
      displayName: 'Yi Lightning',
      enabled: true,
      id: 'yi-lightning',
      pricing: {
        currency: 'CNY',
        input: 0.99,
        output: 0.99,
      },
    },
    {
      contextWindowTokens: 16_384,
      description: '复杂视觉任务模型，提供基于多张图片的高性能理解、分析能力。',
      displayName: 'Yi Vision V2',
      enabled: true,
      id: 'yi-vision-v2',
      pricing: {
        currency: 'CNY',
        input: 6,
        output: 6,
      },
      vision: true,
    },
    {
      contextWindowTokens: 16_384,
      description: '小而精悍，轻量极速模型。提供强化数学运算和代码编写能力。',
      displayName: 'Yi Spark',
      id: 'yi-spark',
      pricing: {
        currency: 'CNY',
        input: 1,
        output: 1,
      },
    },
    {
      contextWindowTokens: 16_384,
      description: '中型尺寸模型升级微调，能力均衡，性价比高。深度优化指令遵循能力。',
      displayName: 'Yi Medium',
      id: 'yi-medium',
      pricing: {
        currency: 'CNY',
        input: 2.5,
        output: 2.5,
      },
    },
    {
      contextWindowTokens: 200_000,
      description: '200K 超长上下文窗口，提供长文本深度理解和生成能力。',
      displayName: 'Yi Medium 200K',
      id: 'yi-medium-200k',
      pricing: {
        currency: 'CNY',
        input: 12,
        output: 12,
      },
    },
    {
      contextWindowTokens: 16_384,
      description: '超高性价比、卓越性能。根据性能和推理速度、成本，进行平衡性高精度调优。',
      displayName: 'Yi Large Turbo',
      id: 'yi-large-turbo',
      pricing: {
        currency: 'CNY',
        input: 12,
        output: 12,
      },
    },
    {
      contextWindowTokens: 16_384,
      description:
        '基于 yi-large 超强模型的高阶服务，结合检索与生成技术提供精准答案，实时全网检索信息服务。',
      displayName: 'Yi Large RAG',
      id: 'yi-large-rag',
      pricing: {
        currency: 'CNY',
        input: 25,
        output: 25,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        '在 yi-large 模型的基础上支持并强化了工具调用的能力，适用于各种需要搭建 agent 或 workflow 的业务场景。',
      displayName: 'Yi Large FC',
      functionCall: true,
      id: 'yi-large-fc',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 20,
      },
    },
    {
      contextWindowTokens: 32_768,
      description: '全新千亿参数模型，提供超强问答及文本生成能力。',
      displayName: 'Yi Large',
      id: 'yi-large',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 20,
      },
    },
    {
      contextWindowTokens: 16_384,
      description: '复杂视觉任务模型，提供高性能图片理解、分析能力。',
      displayName: 'Yi Vision',
      id: 'yi-vision',
      pricing: {
        currency: 'CNY',
        input: 6,
        output: 6,
      },
      vision: true,
    },
    {
      contextWindowTokens: 16_384,
      description: '初期版本，推荐使用 yi-large（新版本）。',
      displayName: 'Yi Large Preview',
      id: 'yi-large-preview',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 20,
      },
    },
    {
      contextWindowTokens: 16_384,
      description: '轻量化版本，推荐使用 yi-lightning。',
      displayName: 'Yi Lightning Lite',
      id: 'yi-lightning-lite',
      pricing: {
        currency: 'CNY',
        input: 0.99,
        output: 0.99,
      },
    },
  ],
  checkModel: 'yi-lightning',
  description:
    '零一万物致力于推动以人为本的AI 2.0技术革命，旨在通过大语言模型创造巨大的经济和社会价值，并开创新的AI生态与商业模式。',
  id: 'zeroone',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.lingyiwanwu.com/docs#模型与计费',
  name: '01.AI',
  settings: {
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://www.lingyiwanwu.com/',
};

export default ZeroOne;
