import { AIChatModelCard } from '@/types/aiModel';

const wenxinChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      '与ERNIE-X1-32K相比，模型效果和性能更好。',
    displayName: 'ERNIE X1 Turbo 32K',
    enabled: true,
    id: 'ernie-x1-turbo-32k',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    releasedAt: '2025-04-24',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      '具备更强的理解、规划、反思、进化能力。作为能力更全面的深度思考模型，文心X1兼备准确、创意和文采，在中文知识问答、文学创作、文稿写作、日常对话、逻辑推理、复杂计算及工具调用等方面表现尤为出色。',
    displayName: 'ERNIE X1 32K',
    id: 'ernie-x1-32k',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    releasedAt: '2025-04-15',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      '文心大模型X1具备更强的理解、规划、反思、进化能力。作为能力更全面的深度思考模型，文心X1兼备准确、创意和文采，在中文知识问答、文学创作、文稿写作、日常对话、逻辑推理、复杂计算及工具调用等方面表现尤为出色。',
    displayName: 'ERNIE X1 32K Preview',
    id: 'ernie-x1-32k-preview',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    releasedAt: '2025-03-16',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description:
      '文心4.5 Turbo在去幻觉、逻辑推理和代码能力等方面也有着明显增强。对比文心4.5，速度更快、价格更低。模型能力全面提升，更好满足多轮长历史对话处理、长文档理解问答任务。',
    displayName: 'ERNIE 4.5 Turbo 128K',
    enabled: true,
    id: 'ernie-4.5-turbo-128k',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 3.2,
    },
    releasedAt: '2025-04-24',
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
    contextWindowTokens: 32_768,
    description:
      '文心4.5 Turbo在去幻觉、逻辑推理和代码能力等方面也有着明显增强。对比文心4.5，速度更快、价格更低。文本创作、知识问答等能力提升显著。输出长度及整句时延相较ERNIE 4.5有所增加。',
    displayName: 'ERNIE 4.5 Turbo 32K',
    id: 'ernie-4.5-turbo-32k',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 3.2,
    },
    releasedAt: '2025-04-24',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      '文心一言大模型全新版本，图片理解、创作、翻译、代码等能力显著提升，首次支持32K上下文长度，首Token时延显著降低。',
    displayName: 'ERNIE 4.5 Turbo VL 32K',
    enabled: true,
    id: 'ernie-4.5-turbo-vl-32k',
    pricing: {
      currency: 'CNY',
      input: 3,
      output: 9,
    },
    releasedAt: '2025-04-24',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 8192,
    description:
      '文心大模型4.5是百度自主研发的新一代原生多模态基础大模型，通过多个模态联合建模实现协同优化，多模态理解能力优秀；具备更精进的语言能力，理解、生成、逻辑、记忆能力全面提升，去幻觉、逻辑推理、代码能力显著提升。',
    displayName: 'ERNIE 4.5 8K Preview',
    id: 'ernie-4.5-8k-preview',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    releasedAt: '2025-03-16',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 4.0 8K',
    id: 'ernie-4.0-8k-latest',
    pricing: {
      currency: 'CNY',
      input: 30,
      output: 90,
    },
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
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 4.0 8K Preview',
    id: 'ernie-4.0-8k-preview',
    pricing: {
      currency: 'CNY',
      input: 30,
      output: 90,
    },
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
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
    displayName: 'ERNIE 4.0 Turbo 8K',
    id: 'ernie-4.0-turbo-8k-latest',
    pricing: {
      currency: 'CNY',
      input: 20,
      output: 60,
    },
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
    contextWindowTokens: 128_000,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
    displayName: 'ERNIE 4.0 Turbo 128K',
    id: 'ernie-4.0-turbo-128k',
    pricing: {
      currency: 'CNY',
      input: 20,
      output: 60,
    },
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
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
    displayName: 'ERNIE 4.0 Turbo 8K Preview',
    id: 'ernie-4.0-turbo-8k-preview',
    pricing: {
      currency: 'CNY',
      input: 20,
      output: 60,
    },
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
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 3.5 8K',
    id: 'ernie-3.5-8k',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
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
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 3.5 8K Preview',
    id: 'ernie-3.5-8k-preview',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
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
    contextWindowTokens: 128_000,
    description:
      '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 3.5 128K',
    id: 'ernie-3.5-128k',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'ERNIE Lite是百度自研的轻量级大语言模型，兼顾优异的模型效果与推理性能，适合低算力AI加速卡推理使用。',
    displayName: 'ERNIE Lite 8K',
    id: 'ernie-lite-8k',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 128_000,
    description:
      '百度自研的轻量级大语言模型，兼顾优异的模型效果与推理性能，效果比ERNIE Lite更优，适合低算力AI加速卡推理使用。',
    displayName: 'ERNIE Lite Pro 128K',
    id: 'ernie-lite-pro-128k',
    pricing: {
      currency: 'CNY',
      input: 0.2,
      output: 0.4,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'ERNIE Tiny是百度自研的超高性能大语言模型，部署与精调成本在文心系列模型中最低。',
    displayName: 'ERNIE Tiny 8K',
    id: 'ernie-tiny-8k',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '百度2024年最新发布的自研高性能大语言模型，通用能力优异，适合作为基座模型进行精调，更好地处理特定场景问题，同时具备极佳的推理性能。',
    displayName: 'ERNIE Speed 128K',
    id: 'ernie-speed-128k',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '百度2024年最新发布的自研高性能大语言模型，通用能力优异，效果比ERNIE Speed更优，适合作为基座模型进行精调，更好地处理特定场景问题，同时具备极佳的推理性能。',
    displayName: 'ERNIE Speed Pro 128K',
    id: 'ernie-speed-pro-128k',
    pricing: {
      currency: 'CNY',
      input: 0.3,
      output: 0.6,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的垂直场景大语言模型，适合游戏NPC、客服对话、对话角色扮演等应用场景，人设风格更为鲜明、一致，指令遵循能力更强，推理性能更优。',
    displayName: 'ERNIE Character 8K',
    id: 'ernie-char-8k',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 8,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的垂直场景大语言模型，适合游戏NPC、客服对话、对话角色扮演等应用场景，人设风格更为鲜明、一致，指令遵循能力更强，推理性能更优。',
    displayName: 'ERNIE Character Fiction 8K',
    id: 'ernie-char-fiction-8k',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 8,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: '百度自研通用大语言模型，在小说续写能力上有明显优势，也可用在短剧、电影等场景。',
    displayName: 'ERNIE Novel 8K',
    id: 'ernie-novel-8k',
    pricing: {
      currency: 'CNY',
      input: 40,
      output: 120,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-V3 为杭州深度求索人工智能基础技术研究有限公司自研的 MoE 模型，其多项评测成绩突出，在主流榜单中位列开源模型榜首。V3 相比 V2.5 模型生成速度实现 3 倍提升，为用户带来更加迅速流畅的使用体验。',
    displayName: 'DeepSeek V3',
    id: 'deepseek-v3',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 1.6,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_536,
    description:
      'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。在数学、代码、自然语言推理等任务上，性能比肩 OpenAI o1 正式版。',
    displayName: 'DeepSeek R1',
    id: 'deepseek-r1',
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
    description: 'DeepSeek-R1-Distill-Qwen-1.5B是DeepSeek-R1基于Qwen-2.5系列的蒸馏模型。',
    displayName: 'DeepSeek R1 Distill Qwen 1.5B',
    id: 'deepseek-r1-distill-qwen-1.5b',
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
    description: 'DeepSeek-R1-Distill-Qwen-7B是DeepSeek-R1基于Qwen-2.5系列的蒸馏模型。',
    displayName: 'DeepSeek R1 Distill Qwen 7B',
    id: 'deepseek-r1-distill-qwen-7b',
    pricing: {
      currency: 'CNY',
      input: 0.6,
      output: 2.4,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek-R1-Distill-Qwen-14B是DeepSeek-R1基于Qwen-2.5系列的蒸馏模型。',
    displayName: 'DeepSeek R1 Distill Qwen 14B',
    id: 'deepseek-r1-distill-qwen-14b',
    pricing: {
      currency: 'CNY',
      input: 0.6,
      output: 2.4,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek-R1-Distill-Qwen-32B是DeepSeek-R1基于Qwen-2.5系列的蒸馏模型。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'deepseek-r1-distill-qwen-32b',
    pricing: {
      currency: 'CNY',
      input: 1.5,
      output: 6,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek-R1-Distill-Llama-8B是DeepSeek-R1基于Llama3.1-8B-Base的蒸馏模型。',
    displayName: 'DeepSeek R1 Distill Llama 8B',
    id: 'deepseek-r1-distill-llama-8b',
    pricing: {
      currency: 'CNY',
      input: 1.5,
      output: 6,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek-R1-Distill-Llama-70B是DeepSeek-R1基于Llama3.3-70B-Instruct的蒸馏模型。',
    displayName: 'DeepSeek R1 Distill Llama 70B',
    id: 'deepseek-r1-distill-llama-70b',
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
      '2025年2月14日首次发布，由千帆大模型研发团队以 Llama3_8B为base模型（Built with Meta Llama）蒸馏所得，蒸馏数据中也同步添加了千帆的语料。',
    displayName: 'DeepSeek R1 Distill Qianfan Llama 8B',
    id: 'deepseek-r1-distill-qianfan-llama-8b',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 4,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      '2025年2月14日首次发布，由千帆大模型研发团队以 Llama3_70B为base模型（Built with Meta Llama）蒸馏所得，蒸馏数据中也同步添加了千帆的语料。',
    displayName: 'DeepSeek R1 Distill Qianfan Llama 70B',
    id: 'deepseek-r1-distill-qianfan-llama-70b',
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
      '通义千问团队推出的高效推理模型，支持消费级硬件部署，具备强大的实时推理能力和与智能体Agent集成的潜力。',
    displayName: 'QwQ 32B',
    id: 'qwq-32b',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    type: 'chat',
  },
];

export const allModels = [...wenxinChatModels];

export default allModels;
