import { AIChatModelCard } from '@/types/aiModel';

const tencentCloudChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-R1 是一款强化学习（RL）驱动的推理模型，解决了模型中的重复性和可读性问题。在 RL 之前，DeepSeek-R1 引入了冷启动数据，进一步优化了推理性能。它在数学、代码和推理任务中与 OpenAI-o1 表现相当，并且通过精心设计的训练方法，提升了整体效果。',
    displayName: 'DeepSeek R1',
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
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3-0324 为671B 参数 MoE 模型，在编程与技术能力、上下文理解与长文本处理等方面优势突出。',
    displayName: 'DeepSeek-V3-0324',
    enabled: true,
    id: 'deepseek-v3-0324',
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
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 是一款拥有 6710 亿参数的混合专家（MoE）语言模型，采用多头潜在注意力（MLA）和 DeepSeekMoE 架构，结合无辅助损失的负载平衡策略，优化推理和训练效率。通过在 14.8 万亿高质量tokens上预训练，并进行监督微调和强化学习，DeepSeek-V3 在性能上超越其他开源模型，接近领先闭源模型。',
    displayName: 'DeepSeek V3',
    enabled: true,
    id: 'deepseek-v3',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    type: 'chat',
  },
];

export const allModels = [...tencentCloudChatModels];

export default allModels;
