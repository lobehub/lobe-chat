import { AIChatModelCard } from '@/types/aiModel';

// https://docs.wair.ac.cn/maas/jiage.html

const taichuChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'taichu_o1是新一代推理大模型，通过多模态交互和强化学习实现类人思维链，支持复杂决策推演，在保持高精度输出的同时展现可模型推理的思维路径，适用于策略分析与深度思考等场景。',
    displayName: 'Taichu O1',
    enabled: true,
    id: 'taichu_o1',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_768,
    description: '基于海量高质数据训练，具有更强的文本理解、内容创作、对话问答等能力',
    displayName: 'Taichu 2.0',
    enabled: true,
    id: 'taichu_llm',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: '融合了图像理解、知识迁移、逻辑归因等能力，在图文问答领域表现突出',
    displayName: 'Taichu 2.0 VL',
    enabled: true,
    id: 'taichu_vl',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-R1 是一款强化学习（RL）驱动的推理模型，解决了模型中的重复性和可读性问题。在 RL 之前，DeepSeek-R1 引入了冷启动数据，进一步优化了推理性能。它在数学、代码和推理任务中与 OpenAI-o1 表现相当，并且通过精心设计的训练方法，提升了整体效果。',
    displayName: 'DeepSeek R1',
    id: 'deepseek_r1',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-R1-Distill-Qwen-14B 是基于 Qwen2.5-14B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，展现出优秀的推理能力。',
    displayName: 'DeepSeek R1 Distill Qwen 14B',
    id: 'deepseek_r1_distill_qwen_14b',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-R1-Distill-Qwen-32B 是基于 Qwen2.5-32B 通过知识蒸馏得到的模型。该模型使用 DeepSeek-R1 生成的 80 万个精选样本进行微调，在数学、编程和推理等多个领域展现出卓越的性能。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'deepseek_r1_distill_qwen_32b',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      'DeepSeek-R1-Distill-Llama-70B 是基于 Llama-3.3-70B-Instruct 经过蒸馏训练得到的模型。该模型是 DeepSeek-R1 系列的一部分，通过使用 DeepSeek-R1 生成的样本进行微调，在数学、编程和推理等多个领域展现出优秀的性能。',
    displayName: 'DeepSeek R1 Distill Llama 70B',
    id: 'deepseek_r1_distill_llama_70b',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen 系列中等规模的推理模型。与传统的指令调优模型相比，具备思考和推理能力的 QwQ 在下游任务中，尤其是在解决难题时，能够显著提升性能。',
    displayName: 'QwQ 32B',
    id: 'qwq_32b',
    type: 'chat',
  },
];

export const allModels = [...taichuChatModels];

export default allModels;
