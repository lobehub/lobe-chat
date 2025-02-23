import { AIChatModelCard } from '@/types/aiModel';

// https://cloud.tencent.com/document/product/1729/104753

const hunyuanChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 256_000,
    description:
      '升级为 MOE 结构，上下文窗口为 256k ，在 NLP，代码，数学，行业等多项评测集上领先众多开源模型。',
    displayName: 'Hunyuan Lite',
    enabled: true,
    id: 'hunyuan-lite',
    maxOutput: 6000,
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    releasedAt: '2024-10-30',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description:
      '采用更优的路由策略，同时缓解了负载均衡和专家趋同的问题。长文方面，大海捞针指标达到99.9%。MOE-32K 性价比相对更高，在平衡效果、价格的同时，可对实现对长文本输入的处理。',
    displayName: 'Hunyuan Standard',
    enabled: true,
    id: 'hunyuan-standard',
    maxOutput: 2000,
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    releasedAt: '2025-02-10',
    type: 'chat',
  },
  {
    contextWindowTokens: 256_000,
    description:
      '采用更优的路由策略，同时缓解了负载均衡和专家趋同的问题。长文方面，大海捞针指标达到99.9%。MOE-256K 在长度和效果上进一步突破，极大的扩展了可输入长度。',
    displayName: 'Hunyuan Standard 256K',
    enabled: true,
    id: 'hunyuan-standard-256K',
    maxOutput: 6000,
    pricing: {
      currency: 'CNY',
      input: 0.5,
      output: 2,
    },
    releasedAt: '2025-02-10',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_000,
    description:
      '通用体验优化，包括NLP理解、文本创作、闲聊、知识问答、翻译、领域等；提升拟人性，优化模型情商；提升意图模糊时模型主动澄清能力；提升字词解析类问题的处理能力；提升创作的质量和可互动性；提升多轮体验。',
    displayName: 'Hunyuan Turbo Latest',
    enabled: true,
    id: 'hunyuan-turbo-latest',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 50,
    },
    releasedAt: '2025-01-10',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_000,
    description:
      '本版本优化：数据指令scaling，大幅提升模型通用泛化能力；大幅提升数学、代码、逻辑推理能力；优化文本理解字词理解相关能力；优化文本创作内容生成质量',
    displayName: 'Hunyuan Turbo',
    id: 'hunyuan-turbo',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 50,
    },
    releasedAt: '2025-01-10',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_000,
    description:
      '本版本优化：数据指令scaling，大幅提升模型通用泛化能力；大幅提升数学、代码、逻辑推理能力；优化文本理解字词理解相关能力；优化文本创作内容生成质量',
    displayName: 'Hunyuan Turbo 20241223',
    id: 'hunyuan-turbo-20241223',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 50,
    },
    releasedAt: '2025-01-10',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_000,
    description:
      'hunyuan-turbo 2024 年 11 月 20 日固定版本，介于 hunyuan-turbo 和 hunyuan-turbo-latest 之间的一个版本。',
    displayName: 'Hunyuan Turbo 20241120',
    id: 'hunyuan-turbo-20241120',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 15,
      output: 50,
    },
    releasedAt: '2024-11-20',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description:
      'Hunyuan-large 模型总参数量约 389B，激活参数量约 52B，是当前业界参数规模最大、效果最好的 Transformer 架构的开源 MoE 模型。',
    displayName: 'Hunyuan Large',
    enabled: true,
    id: 'hunyuan-large',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 12,
    },
    releasedAt: '2025-02-10',
    type: 'chat',
  },
  {
    contextWindowTokens: 134_000,
    description:
      '擅长处理长文任务如文档摘要和文档问答等，同时也具备处理通用文本生成任务的能力。在长文本的分析和生成上表现优异，能有效应对复杂和详尽的长文内容处理需求。',
    displayName: 'Hunyuan Large Longcontext',
    enabled: true,
    id: 'hunyuan-large-longcontext',
    maxOutput: 6000,
    pricing: {
      currency: 'CNY',
      input: 6,
      output: 18,
    },
    releasedAt: '2024-12-18',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 36_000,
    description: '混元最新7B多模态模型，上下文窗口32K，支持中英文场景的多模态对话、图像物体识别、文档表格理解、多模态数学等，在多个维度上评测指标优于7B竞品模型。',
    displayName: 'Hunyuan Lite Vision',
    enabled: true,
    id: 'hunyuan-lite-vision',
    maxOutput: 4000,
    releasedAt: '2024-12-12',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 8000,
    description: '混元最新多模态模型，支持多语种作答，中英文能力均衡。',
    displayName: 'Hunyuan Standard Vision',
    enabled: true,
    id: 'hunyuan-standard-vision',
    maxOutput: 2000,
    releasedAt: '2024-12-31',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 8000,
    description: '混元新一代视觉语言旗舰大模型，采用全新的混合专家模型（MoE）结构，在图文理解相关的基础识别、内容创作、知识问答、分析推理等能力上相比前一代模型全面提升。',
    displayName: 'Hunyuan Turbo Vision',
    enabled: true,
    id: 'hunyuan-turbo-vision',
    maxOutput: 2000,
    pricing: {
      currency: 'CNY',
      input: 80,
      output: 80,
    },
    releasedAt: '2024-11-26',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 12_000,
    description: '混元最新多模态模型，支持图片+文本输入生成文本内容。',
    displayName: 'Hunyuan Vision',
    enabled: true,
    id: 'hunyuan-vision',
    maxOutput: 6000,
    pricing: {
      currency: 'CNY',
      input: 18,
      output: 18,
    },
    releasedAt: '2025-01-03',
    type: 'chat',
  },
  {
    contextWindowTokens: 8000,
    description:
      '混元最新代码生成模型，经过 200B 高质量代码数据增训基座模型，迭代半年高质量 SFT 数据训练，上下文长窗口长度增大到 8K，五大语言代码生成自动评测指标上位居前列；五大语言10项考量各方面综合代码任务人工高质量评测上，性能处于第一梯队',
    displayName: 'Hunyuan Code',
    id: 'hunyuan-code',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 8,
    },
    releasedAt: '2024-11-12',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 32_000,
    description:
      '混元最新 MOE 架构 FunctionCall 模型，经过高质量的 FunctionCall 数据训练，上下文窗口达 32K，在多个维度的评测指标上处于领先。',
    displayName: 'Hunyuan FunctionCall',
    id: 'hunyuan-functioncall',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 8,
    },
    releasedAt: '2024-11-15',
    type: 'chat',
  },
  {
    contextWindowTokens: 32_000,
    description:
      '混元最新版角色扮演模型，混元官方精调训练推出的角色扮演模型，基于混元模型结合角色扮演场景数据集进行增训，在角色扮演场景具有更好的基础效果。',
    displayName: 'Hunyuan Role',
    id: 'hunyuan-role',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 8,
    },
    releasedAt: '2024-07-04',
    type: 'chat',
  },
  {
    contextWindowTokens: 8000,
    description:
      '支持中文和英语、日语、法语、葡萄牙语、西班牙语、土耳其语、俄语、阿拉伯语、韩语、意大利语、德语、越南语、马来语、印尼语15种语言互译，基于多场景翻译评测集自动化评估COMET评分，在十余种常用语种中外互译能力上整体优于市场同规模模型。',
    displayName: 'Hunyuan Translation',
    id: 'hunyuan-translation',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 25,
      output: 75,
    },
    releasedAt: '2024-10-25',
    type: 'chat',
  },
  {
    contextWindowTokens: 8000,
    description:
      '混元翻译模型支持自然语言对话式翻译；支持中文和英语、日语、法语、葡萄牙语、西班牙语、土耳其语、俄语、阿拉伯语、韩语、意大利语、德语、越南语、马来语、印尼语15种语言互译。',
    displayName: 'Hunyuan Translation Lite',
    id: 'hunyuan-translation-lite',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 15,
    },
    releasedAt: '2024-11-25',
    type: 'chat',
  },
];

export const allModels = [...hunyuanChatModels];

export default allModels;
