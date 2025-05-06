import { ModelProviderCard } from '@/types/llm';

// ref: https://ai.google.dev/gemini-api/docs/models/gemini
const Google: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 1_048_576 + 65_536,
      description:
        'Gemini 2.5 Pro Experimental 是 Google 最先进的思维模型，能够对代码、数学和STEM领域的复杂问题进行推理，以及使用长上下文分析大型数据集、代码库和文档。',
      displayName: 'Gemini 2.5 Pro Experimental 03-25',
      enabled: true,
      functionCall: true,
      id: 'gemini-2.5-pro-exp-03-25',
      maxOutput: 65_536,
      pricing: {
        input: 0,
        output: 0,
      },
      releasedAt: '2025-03-25',
      vision: true,
    },
    {
      contextWindowTokens: 2_097_152 + 8192,
      description:
        'Gemini 2.0 Pro Experimental 是 Google 最新的实验性多模态AI模型，与历史版本相比有一定的质量提升，特别是对于世界知识、代码和长上下文。',
      displayName: 'Gemini 2.0 Pro Experimental 02-05',
      enabled: true,
      functionCall: true,
      id: 'gemini-2.0-pro-exp-02-05',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0,
        input: 0,
        output: 0,
      },
      releasedAt: '2025-02-05',
      vision: true,
    },
    {
      contextWindowTokens: 1_048_576 + 8192,
      description:
        'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
      displayName: 'Gemini 2.0 Flash',
      enabled: true,
      functionCall: true,
      id: 'gemini-2.0-flash',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.025,
        input: 0.1,
        output: 0.4,
      },
      releasedAt: '2025-02-05',
      vision: true,
    },
    {
      contextWindowTokens: 1_048_576 + 8192,
      description:
        'Gemini 2.0 Flash 提供下一代功能和改进，包括卓越的速度、原生工具使用、多模态生成和1M令牌上下文窗口。',
      displayName: 'Gemini 2.0 Flash 001',
      functionCall: true,
      id: 'gemini-2.0-flash-001',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.025,
        input: 0.1,
        output: 0.4,
      },
      releasedAt: '2025-02-05',
      vision: true,
    },
    {
      contextWindowTokens: 1_048_576 + 8192,
      description: '一个 Gemini 2.0 Flash 模型，针对成本效益和低延迟等目标进行了优化。',
      displayName: 'Gemini 2.0 Flash-Lite Preview 02-05',
      id: 'gemini-2.0-flash-lite-preview-02-05',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.018_75,
        input: 0.075,
        output: 0.3,
      },
      releasedAt: '2025-02-05',
      vision: true,
    },
    {
      contextWindowTokens: 1_048_576 + 65_536,
      description:
        'Gemini 2.0 Flash Thinking Exp 是 Google 的实验性多模态推理AI模型，能对复杂问题进行推理，拥有新的思维能力。',
      displayName: 'Gemini 2.0 Flash Thinking Experimental 01-21',
      enabled: true,
      id: 'gemini-2.0-flash-thinking-exp-01-21',
      maxOutput: 65_536,
      pricing: {
        cachedInput: 0,
        input: 0,
        output: 0,
      },
      releasedAt: '2025-01-21',
      vision: true,
    },
    {
      contextWindowTokens: 40_959,
      description:
        'LearnLM 是一个实验性的、特定于任务的语言模型，经过训练以符合学习科学原则，可在教学和学习场景中遵循系统指令，充当专家导师等。',
      displayName: 'LearnLM 1.5 Pro Experimental',
      functionCall: true,
      id: 'learnlm-1.5-pro-experimental',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0,
        input: 0,
        output: 0,
      },
      releasedAt: '2024-11-19',
      vision: true,
    },
    {
      contextWindowTokens: 1_008_192,
      description: 'Gemini 1.5 Flash 002 是一款高效的多模态模型，支持广泛应用的扩展。',
      displayName: 'Gemini 1.5 Flash 002',
      functionCall: true,
      id: 'gemini-1.5-flash-002',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.018_75,
        input: 0.075,
        output: 0.3,
      },
      releasedAt: '2024-09-25',
      vision: true,
    },
    {
      contextWindowTokens: 1_008_192,
      description: 'Gemini 1.5 Flash 001 是一款高效的多模态模型，支持广泛应用的扩展。',
      displayName: 'Gemini 1.5 Flash 001',
      functionCall: true,
      id: 'gemini-1.5-flash-001',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.018_75,
        input: 0.075,
        output: 0.3,
      },
      vision: true,
    },
    {
      contextWindowTokens: 2_008_192,
      description:
        'Gemini 1.5 Pro 002 是最新的生产就绪模型，提供更高质量的输出，特别在数学、长上下文和视觉任务方面有显著提升。',
      displayName: 'Gemini 1.5 Pro 002',
      functionCall: true,
      id: 'gemini-1.5-pro-002',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.315,
        input: 1.25,
        output: 2.5,
      },
      releasedAt: '2024-09-24',
      vision: true,
    },
    {
      contextWindowTokens: 2_008_192,
      description: 'Gemini 1.5 Pro 001 是可扩展的多模态AI解决方案，支持广泛的复杂任务。',
      displayName: 'Gemini 1.5 Pro 001',
      functionCall: true,
      id: 'gemini-1.5-pro-001',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.875,
        input: 3.5,
        output: 10.5,
      },
      releasedAt: '2024-02-15',
      vision: true,
    },
    {
      contextWindowTokens: 1_008_192,
      description: 'Gemini 1.5 Flash 8B 是一款高效的多模态模型，支持广泛应用的扩展。',
      displayName: 'Gemini 1.5 Flash 8B',
      functionCall: true,
      id: 'gemini-1.5-flash-8b',
      maxOutput: 8192,
      pricing: {
        cachedInput: 0.02,
        input: 0.075,
        output: 0.3,
      },
      releasedAt: '2024-10-03',
      vision: true,
    },
  ],
  checkModel: 'gemini-2.0-flash',
  description:
    'Google 的 Gemini 系列是其最先进、通用的 AI模型，由 Google DeepMind 打造，专为多模态设计，支持文本、代码、图像、音频和视频的无缝理解与处理。适用于从数据中心到移动设备的多种环境，极大提升了AI模型的效率与应用广泛性。',
  enabled: true,
  id: 'google',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
  name: 'Google',
  proxyUrl: {
    placeholder: 'https://generativelanguage.googleapis.com',
  },
  settings: {
    proxyUrl: {
      placeholder: 'https://generativelanguage.googleapis.com',
    },
    sdkType: 'google',
    showModelFetcher: true,
    smoothing: {
      speed: 50,
      text: true,
    },
  },
  url: 'https://ai.google.dev',
};

export default Google;
