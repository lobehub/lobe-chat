import { AIChatModelCard } from '../types/aiModel';

// https://cloud.tencent.com/document/product/1772/115969
const tencentCloudChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-R1 为671B 模型，使用强化学习训练，推理过程包含大量反思和验证，思维链长度可达数万字。 该系列模型在数学、代码以及各种复杂逻辑推理任务上推理效果优异，并为用户展现了完整的思考过程。',
    displayName: 'DeepSeek R1',
    enabled: true,
    id: 'deepseek-r1',
    maxOutput: 16_000,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3-0324 为671B 参数 MoE 模型，在编程与技术能力、上下文理解与长文本处理等方面优势突出。',
    displayName: 'DeepSeek V3 0324',
    enabled: true,
    id: 'deepseek-v3-0324',
    maxOutput: 16_000,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 65_536,
    description: 'DeepSeek-V3 为671B 参数 MoE 模型，在百科知识、数学推理等多项任务上优势突出。',
    displayName: 'DeepSeek V3',
    id: 'deepseek-v3',
    maxOutput: 16_000,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...tencentCloudChatModels];

export default allModels;
