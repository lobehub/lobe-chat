import { AIChatModelCard } from '@/types/aiModel';

// https://platform.sensenova.cn/pricing
// https://www.sensecore.cn/help/docs/model-as-a-service/nova/release

const sensenovaChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: '兼顾视觉、语言深度推理，实现慢思考和深度推理，呈现完整的思维链过程。',
    displayName: 'SenseNova V6 Reasoner',
    enabled: true,
    id: 'SenseNova-V6-Reasoner',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      '实现图片、文本、视频能力的原生统一，突破传统多模态分立局限，在多模基础能力、语言基础能力等核心维度全面领先，文理兼修，在多项测评中多次位列国内外第一梯队水平。',
    displayName: 'SenseNova V6 Turbo',
    enabled: true,
    id: 'SenseNova-V6-Turbo',
    pricing: {
      currency: 'CNY',
      input: 1.5,
      output: 4.5,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      '实现图片、文本、视频能力的原生统一，突破传统多模态分立局限，在OpenCompass和SuperCLUE评测中斩获双冠军。',
    displayName: 'SenseNova V6 Pro',
    enabled: true,
    id: 'SenseNova-V6-Pro',
    pricing: {
      currency: 'CNY',
      input: 3,
      output: 9,
    },
    releasedAt: '2025-04-14',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '部分性能优于 SenseCat-5-1202',
    displayName: 'SenseChat 5.5 Beta',
    id: 'SenseChat-5-beta',
    pricing: {
      currency: 'CNY',
      input: 8,
      output: 20,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description:
      '是基于V5.5的最新版本，较上版本在中英文基础能力，聊天，理科知识， 文科知识，写作，数理逻辑，字数控制 等几个维度的表现有显著提升。',
    displayName: 'SenseChat 5.5 1202',
    id: 'SenseCat-5-1202',
    pricing: {
      currency: 'CNY',
      input: 8,
      output: 20,
    },
    releasedAt: '2024-12-30',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: '是最新的轻量版本模型，达到全量模型90%以上能力，显著降低推理成本。',
    displayName: 'SenseChat Turbo 1202',
    id: 'SenseChat-Turbo-1202',
    pricing: {
      currency: 'CNY',
      input: 0.3,
      output: 0.6,
    },
    releasedAt: '2024-12-30',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      '最新版本模型 (V5.5)，128K上下文长度，在数学推理、英文对话、指令跟随以及长文本理解等领域能力显著提升，比肩GPT-4o。',
    displayName: 'SenseChat 5.5',
    id: 'SenseChat-5',
    maxOutput: 131_072,
    pricing: {
      currency: 'CNY',
      input: 8,
      output: 20,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_384,
    description:
      '最新版本模型 (V5.5)，支持多图的输入，全面实现模型基础能力优化，在对象属性识别、空间关系、动作事件识别、场景理解、情感识别、逻辑常识推理和文本理解生成上都实现了较大提升。',
    displayName: 'SenseChat 5.5 Vision',
    id: 'SenseChat-Vision',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      input: 10, // 限时优惠
      output: 60,
    },
    releasedAt: '2024-09-12',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: '适用于快速问答、模型微调场景',
    displayName: 'SenseChat 5.0 Turbo',
    id: 'SenseChat-Turbo',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      input: 0.3,
      output: 0.6,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '基础版本模型 (V4)，128K上下文长度，在长文本理解及生成等任务中表现出色',
    displayName: 'SenseChat 4.0 128K',
    id: 'SenseChat-128K',
    maxOutput: 131_072,
    pricing: {
      currency: 'CNY',
      input: 60,
      output: 60,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '基础版本模型 (V4)，32K上下文长度，灵活应用于各类场景',
    displayName: 'SenseChat 4.0 32K',
    id: 'SenseChat-32K',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      input: 36,
      output: 36,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: '基础版本模型 (V4)，4K上下文长度，通用能力强大',
    displayName: 'SenseChat 4.0 4K',
    id: 'SenseChat',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 12,
      output: 12,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      '专门为适应香港地区的对话习惯、俚语及本地知识而设计，在粤语的对话理解上超越了GPT-4，在知识、推理、数学及代码编写等多个领域均能与GPT-4 Turbo相媲美。',
    displayName: 'SenseChat 5.0 Cantonese',
    id: 'SenseChat-5-Cantonese',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      input: 27,
      output: 27,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '拟人对话标准版模型，8K上下文长度，高响应速度',
    displayName: 'SenseChat Character',
    id: 'SenseChat-Character',
    maxOutput: 1024,
    pricing: {
      currency: 'CNY',
      input: 12,
      output: 12,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '拟人对话高级版模型，32K上下文长度，能力全面提升，支持中/英文对话',
    displayName: 'SenseChat Character Pro',
    id: 'SenseChat-Character-Pro',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 15,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-V3 是一款由深度求索公司自研的MoE模型。DeepSeek-V3 多项评测成绩超越了 Qwen2.5-72B 和 Llama-3.1-405B 等其他开源模型，并在性能上和世界顶尖的闭源模型 GPT-4o 以及 Claude-3.5-Sonnet 不分伯仲。',
    displayName: 'DeepSeek V3',
    id: 'DeepSeek-V3',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。在数学、代码、自然语言推理等任务上，性能比肩 OpenAI o1 正式版。',
    displayName: 'DeepSeek R1',
    id: 'DeepSeek-R1',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill 模型是在开源模型的基础上通过微调训练得到的，训练过程中使用了由 DeepSeek-R1 生成的样本数据。',
    displayName: 'DeepSeek R1 Distill Qwen 14B',
    id: 'DeepSeek-R1-Distill-Qwen-14B',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 8192,
    description:
      'DeepSeek-R1-Distill 模型是在开源模型的基础上通过微调训练得到的，训练过程中使用了由 DeepSeek-R1 生成的样本数据。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'DeepSeek-R1-Distill-Qwen-32B',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
];

export const allModels = [...sensenovaChatModels];

export default allModels;
