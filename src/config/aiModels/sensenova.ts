import { AIChatModelCard } from '@/types/aiModel';

// https://platform.sensenova.cn/pricing
// https://www.sensecore.cn/help/docs/model-as-a-service/nova/release

const sensenovaChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description:
      '是基于V5.5的最新版本，较上版本在中英文基础能力，聊天，理科知识， 文科知识，写作，数理逻辑，字数控制 等几个维度的表现有显著提升。',
    displayName: 'SenseChat 5.5 1202',
    enabled: true,
    id: 'SenseChat-5-1202',
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
    description:
      '是最新的轻量版本模型，达到全量模型90%以上能力，显著降低推理成本。',
    displayName: 'SenseChat Turbo 1202',
    enabled: true,
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
    enabled: true,
    id: 'SenseChat-5',
    pricing: {
      currency: 'CNY',
      input: 40,
      output: 100,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: '最新版本模型 (V5.5)，支持多图的输入，全面实现模型基础能力优化，在对象属性识别、空间关系、动作事件识别、场景理解、情感识别、逻辑常识推理和文本理解生成上都实现了较大提升。',
    displayName: 'SenseChat 5.5 Vision',
    enabled: true,
    id: 'SenseChat-Vision',
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
    enabled: true,
    id: 'SenseChat-Turbo',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 5,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '基础版本模型 (V4)，128K上下文长度，在长文本理解及生成等任务中表现出色',
    displayName: 'SenseChat 4.0 128K',
    id: 'SenseChat-128K',
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
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 15,
    },
    type: 'chat',
  },
];

export const allModels = [...sensenovaChatModels];

export default allModels;
