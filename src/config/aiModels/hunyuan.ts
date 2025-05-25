import { AIChatModelCard } from '@/types/aiModel';

// https://cloud.tencent.com/document/product/1729/104753

const hunyuanChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 92_000,
    description:
      '业内首个超大规模 Hybrid-Transformer-Mamba 推理模型，扩展推理能力，超强解码速度，进一步对齐人类偏好。',
    displayName: 'Hunyuan T1',
    enabled: true,
    id: 'hunyuan-t1-latest',
    maxOutput: 64_000,
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-04-03',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 92_000,
    description:
      '全面搭建模型文理科能力，长文本信息捕捉能力强。支持推理解答各种难度的数学/逻辑推理/科学/代码等科学问题。',
    displayName: 'Hunyuan T1 20250321',
    id: 'hunyuan-t1-20250321',
    maxOutput: 64_000,
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-03-21',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
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
    abilities: {
      search: true,
    },
    contextWindowTokens: 32_000,
    description:
      '采用更优的路由策略，同时缓解了负载均衡和专家趋同的问题。长文方面，大海捞针指标达到99.9%。MOE-32K 性价比相对更高，在平衡效果、价格的同时，可对实现对长文本输入的处理。',
    displayName: 'Hunyuan Standard',
    id: 'hunyuan-standard',
    maxOutput: 2000,
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    releasedAt: '2025-02-10',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 256_000,
    description:
      '采用更优的路由策略，同时缓解了负载均衡和专家趋同的问题。长文方面，大海捞针指标达到99.9%。MOE-256K 在长度和效果上进一步突破，极大的扩展了可输入长度。',
    displayName: 'Hunyuan Standard 256K',
    id: 'hunyuan-standard-256K',
    maxOutput: 6000,
    pricing: {
      currency: 'CNY',
      input: 0.5,
      output: 2,
    },
    releasedAt: '2025-02-10',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
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
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 134_000,
    description:
      '擅长处理长文任务如文档摘要和文档问答等，同时也具备处理通用文本生成任务的能力。在长文本的分析和生成上表现优异，能有效应对复杂和详尽的长文内容处理需求。',
    displayName: 'Hunyuan Large Longcontext',
    id: 'hunyuan-large-longcontext',
    maxOutput: 6000,
    pricing: {
      currency: 'CNY',
      input: 6,
      output: 18,
    },
    releasedAt: '2024-12-18',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 32_000,
    description:
      '通用体验优化，包括NLP理解、文本创作、闲聊、知识问答、翻译、领域等；提升拟人性，优化模型情商；提升意图模糊时模型主动澄清能力；提升字词解析类问题的处理能力；提升创作的质量和可互动性；提升多轮体验。',
    displayName: 'Hunyuan Turbo',
    id: 'hunyuan-turbo-latest',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 2.4,
      output: 9.6,
    },
    releasedAt: '2025-01-10',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 32_000,
    description:
      '本版本优化：数据指令scaling，大幅提升模型通用泛化能力；大幅提升数学、代码、逻辑推理能力；优化文本理解字词理解相关能力；优化文本创作内容生成质量',
    displayName: 'Hunyuan Turbo 20241223',
    id: 'hunyuan-turbo-20241223',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 2.4,
      output: 9.6,
    },
    releasedAt: '2025-01-10',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 134_000,
    description:
      '擅长处理长文任务如文档摘要和文档问答等，同时也具备处理通用文本生成任务的能力。在长文本的分析和生成上表现优异，能有效应对复杂和详尽的长文内容处理需求。',
    displayName: 'Hunyuan TurboS LongText 128K',
    id: 'hunyuan-turbos-longtext-128k-20250325',
    maxOutput: 6000,
    pricing: {
      currency: 'CNY',
      input: 1.5,
      output: 6,
    },
    releasedAt: '2025-03-25',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 32_000,
    description: 'hunyuan-TurboS 混元旗舰大模型最新版本，具备更强的思考能力，更优的体验效果。',
    displayName: 'Hunyuan TurboS',
    enabled: true,
    id: 'hunyuan-turbos-latest',
    maxOutput: 8000,
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    releasedAt: '2025-05-20',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  // 重定向模型先行注释，待 latest 更新后再显示
  // {
  //   abilities: {
  //     functionCall: true,
  //     search: true,
  //   },
  //   contextWindowTokens: 32_000,
  //   description:
  //     '统一数学解题步骤的风格，加强数学多轮问答。文本创作优化回答风格，去除AI味，增加文采。',
  //   displayName: 'Hunyuan TurboS 20250313',
  //   id: 'hunyuan-turbos-20250313',
  //   maxOutput: 8000,
  //   pricing: {
  //     currency: 'CNY',
  //     input: 0.8,
  //     output: 2,
  //   },
  //   releasedAt: '2025-03-13',
  //   settings: {
  //     searchImpl: 'params',
  //   },
  //   type: 'chat',
  // },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 32_000,
    description:
      'hunyuan-TurboS pv2.1.2 固定版本预训练底座训练token 数升级；数学/逻辑/代码等思考能力提升；中英文通用体验效果提升，包括文本创作、文本理解、知识问答、闲聊等。',
    displayName: 'Hunyuan TurboS 20250226',
    id: 'hunyuan-turbos-20250226',
    maxOutput: 8000,
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    releasedAt: '2025-02-25',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 36_000,
    description:
      '混元最新7B多模态模型，上下文窗口32K，支持中英文场景的多模态对话、图像物体识别、文档表格理解、多模态数学等，在多个维度上评测指标优于7B竞品模型。',
    displayName: 'Hunyuan Lite Vision',
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
    description:
      '混元新一代视觉语言旗舰大模型，采用全新的混合专家模型（MoE）结构，在图文理解相关的基础识别、内容创作、知识问答、分析推理等能力上相比前一代模型全面提升。',
    displayName: 'Hunyuan Turbo Vision',
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
    contextWindowTokens: 8000,
    description:
      '此模型适用于图文理解场景，是基于混元最新 turbos 的新一代视觉语言旗舰大模型，聚焦图文理解相关任务，包括基于图片的实体识别、知识问答、文案创作、拍照解题等方面，相比前一代模型全面提升。',
    displayName: 'Hunyuan TurboS Vision',
    enabled: true,
    id: 'hunyuan-turbos-vision',
    maxOutput: 2000,
    pricing: {
      currency: 'CNY',
      input: 3,
      output: 9,
    },
    releasedAt: '2025-04-07',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_000,
    description: '混元最新多模态模型，支持图片+文本输入生成文本内容。',
    displayName: 'Hunyuan Vision',
    enabled: true,
    id: 'hunyuan-vision',
    maxOutput: 16_000,
    pricing: {
      currency: 'CNY',
      input: 18,
      output: 18,
    },
    releasedAt: '2025-01-03',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 8192 + 24_576,
    description: '混元多模态理解深度思考模型，支持多模态原生长思维链，擅长处理各种图片推理场景，在理科难题上相比快思考模型全面提升。',
    displayName: 'Hunyuan T1 Vision',
    enabled: true,
    id: 'hunyuan-t1-vision',
    maxOutput: 8192,
    releasedAt: '2025-05-16',
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
      input: 3.5,
      output: 7,
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
    releasedAt: '2025-04-22',
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
      '混元翻译模型支持自然语言对话式翻译；支持中文和英语、日语、法语、葡萄牙语、西班牙语、土耳其语、俄语、阿拉伯语、韩语、意大利语、德语、越南语、马来语、印尼语15种语言互译。',
    displayName: 'Hunyuan Translation Lite',
    id: 'hunyuan-translation-lite',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 3,
    },
    releasedAt: '2024-11-25',
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
      input: 15,
      output: 45,
    },
    releasedAt: '2024-10-25',
    type: 'chat',
  },
];

export const allModels = [...hunyuanChatModels];

export default allModels;
