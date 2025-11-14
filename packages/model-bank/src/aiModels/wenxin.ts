import { AIChatModelCard, AIImageModelCard } from '../types/aiModel';

// https://cloud.baidu.com/doc/qianfan/s/rmh4stp0j

const wenxinChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      '文心5.0 Thinking 预览版，原生全模态旗舰模型，支持文本、图像、音频、视频统一建模，综合能力全面升级，适用于复杂问答、创作与智能体场景。',
    displayName: 'ERNIE 5.0 Thinking Preview',
    enabled: true,
    id: 'ernie-5.0-thinking-preview',
    maxOutput: 65_536,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 0.032]': 6,
              '[0.032, 0.128]': 10,
            },
            pricingParams: ['textInput'],
          },
          name: 'textInput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 0.032]': 24,
              '[0.032, 0.128]': 40,
            },
            pricingParams: ['textInput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    releasedAt: '2025-11-12',
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
    contextWindowTokens: 131_072,
    description:
      'ERNIE 4.5 Turbo 128K，高性能通用模型，支持搜索增强与工具调用，适用于问答、代码、智能体等多种业务场景。',
    displayName: 'ERNIE 4.5 Turbo 128K',
    enabled: true,
    id: 'ernie-4.5-turbo-128k',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
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
    contextWindowTokens: 131_072,
    description: 'ERNIE 4.5 Turbo 128K 预览版，提供与正式版一致的能力体验，适合联调和灰度测试。',
    displayName: 'ERNIE 4.5 Turbo 128K Preview',
    id: 'ernie-4.5-turbo-128k-preview',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 32_768,
    description: 'ERNIE 4.5 Turbo 32K，中长上下文版本，适用于问答、知识库检索和多轮对话等场景。',
    displayName: 'ERNIE 4.5 Turbo 32K',
    id: 'ernie-4.5-turbo-32k',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
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
    contextWindowTokens: 131_072,
    description: 'ERNIE 4.5 Turbo 最新版，综合性能优化，适合作为生产环境通用主力模型。',
    displayName: 'ERNIE 4.5 Turbo Latest',
    id: 'ernie-4.5-turbo-latest',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'ERNIE Speed 128K，免输入输出费用的大模型，适合长文本理解与大规模试用场景。',
    displayName: 'ERNIE Speed 128K',
    id: 'ernie-speed-128k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'ERNIE Speed 8K，免费快速模型，适合日常对话和轻量文本任务。',
    displayName: 'ERNIE Speed 8K',
    id: 'ernie-speed-8k',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'ERNIE Speed Pro 128K，高并发高性价比模型，适合大规模在线服务与企业应用。',
    displayName: 'ERNIE Speed Pro 128K',
    id: 'ernie-speed-pro-128k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'ERNIE Lite 8K，轻量级通用模型，适合对成本敏感的日常问答和内容生成场景。',
    displayName: 'ERNIE Lite 8K',
    id: 'ernie-lite-8k',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'ERNIE Lite Pro 128K，轻量高性能模型，适合对延迟和成本敏感的业务场景。',
    displayName: 'ERNIE Lite Pro 128K',
    id: 'ernie-lite-pro-128k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'ERNIE Tiny 8K，极轻量模型，适合简单问答、分类等低成本推理场景。',
    displayName: 'ERNIE Tiny 8K',
    id: 'ernie-tiny-8k',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'ERNIE Character 8K，角色人格对话模型，适合 IP 角色构建与长期陪伴对话。',
    displayName: 'ERNIE Character 8K',
    id: 'ernie-char-8k',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'ERNIE Character Fiction 8K，面向小说与剧情创作的人格模型，适合长文本故事生成。',
    displayName: 'ERNIE Character Fiction 8K',
    id: 'ernie-char-fiction-8k',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      'ERNIE Character Fiction 8K Preview，人物与剧情创作模型预览版，用于功能体验与测试。',
    displayName: 'ERNIE Character Fiction 8K Preview',
    id: 'ernie-char-fiction-8k-preview',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'ERNIE Novel 8K，长篇小说与 IP 剧情创作模型，擅长多角色、多线叙事。',
    displayName: 'ERNIE Novel 8K',
    id: 'ernie-novel-8k',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 40, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 120, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: 'ERNIE 4.5 0.3B，开源轻量版模型，适合作为本地和定制化部署方案。',
    displayName: 'ERNIE 4.5 0.3B',
    id: 'ernie-4.5-0.3b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      search: true,
    },
    contextWindowTokens: 131_072,
    description: 'ERNIE 4.5 21B A3B，开源大参数版模型，在理解和生成任务上表现更强。',
    displayName: 'ERNIE 4.5 21B A3B',
    id: 'ernie-4.5-21b-a3b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
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
    description: 'ERNIE 4.5 VL 28B A3B，多模态开源模型，支持图文理解与推理任务。',
    displayName: 'ERNIE 4.5 VL 28B A3B',
    id: 'ernie-4.5-vl-28b-a3b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'Qianfan Lightning 128B A19B，高性能中文通用模型，适用于复杂问答与大规模推理任务。',
    displayName: 'Qianfan Lightning 128B A19B',
    id: 'qianfan-lightning-128b-a19b',
    maxOutput: 16_384,
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
    contextWindowTokens: 32_768,
    description: 'Qianfan 8B，中型通用模型，适合成本与效果平衡的文本生成和问答场景。',
    displayName: 'Qianfan 8B',
    id: 'qianfan-8b',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qianfan 70B，大参数中文模型，适合高质量内容生成与复杂推理任务。',
    displayName: 'Qianfan 70B',
    id: 'qianfan-70b',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qianfan Agent Intent 32K，面向意图识别与智能体编排的模型，支持长上下文场景。',
    displayName: 'Qianfan Agent Intent 32K',
    id: 'qianfan-agent-intent-32k',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Qianfan Agent Lite 8K，轻量智能体模型，适合低成本多轮对话与业务编排。',
    displayName: 'Qianfan Agent Lite 8K',
    id: 'qianfan-agent-lite-8k',
    maxOutput: 2048,
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qianfan Agent Speed 32K，高流控智能体模型，适合大规模、多任务 Agent 应用。',
    displayName: 'Qianfan Agent Speed 32K',
    id: 'qianfan-agent-speed-32k',
    maxOutput: 4096,
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Qianfan Agent Speed 8K，面向中短对话与快速响应的高并发智能体模型。',
    displayName: 'Qianfan Agent Speed 8K',
    id: 'qianfan-agent-speed-8k',
    maxOutput: 2048,
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'ERNIE 4.5 Turbo VL Preview，多模态预览模型，支持图文理解与生成，适合视觉问答与内容理解体验。',
    displayName: 'ERNIE 4.5 Turbo VL Preview',
    id: 'ernie-4.5-turbo-vl-preview',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'ERNIE 4.5 Turbo VL，成熟多模态模型，适合生产环境中的图文理解与识别任务。',
    displayName: 'ERNIE 4.5 Turbo VL',
    id: 'ernie-4.5-turbo-vl',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'ERNIE 4.5 Turbo VL 32K，中长文本多模态版本，适用于长文档+图片联合理解。',
    displayName: 'ERNIE 4.5 Turbo VL 32K',
    id: 'ernie-4.5-turbo-vl-32k',
    maxOutput: 12_288,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'ERNIE 4.5 Turbo VL 32K Preview，多模态 32K 预览版，便于评估长上下文视觉能力。',
    displayName: 'ERNIE 4.5 Turbo VL 32K Preview',
    id: 'ernie-4.5-turbo-vl-32k-preview',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'ERNIE 4.5 Turbo VL Latest，多模态最新版本，提供更优图文理解与推理效果。',
    displayName: 'ERNIE 4.5 Turbo VL Latest',
    id: 'ernie-4.5-turbo-vl-latest',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 8192,
    description: 'ERNIE 4.5 8K Preview，8K 上下文预览模型，用于体验与测试文心 4.5 能力。',
    displayName: 'ERNIE 4.5 8K Preview',
    id: 'ernie-4.5-8k-preview',
    maxOutput: 2048,
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
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'Qianfan Composition，多模态创作模型，支持图文混合理解与生成。',
    displayName: 'Qianfan Composition',
    id: 'qianfan-composition',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 7.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qianfan Check VL，多模态内容审核与检测模型，支持图文合规与识别任务。',
    displayName: 'Qianfan Check VL',
    id: 'qianfan-check-vl',
    maxOutput: 131_072,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3.75, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qianfan MultiPicOCR，多图 OCR 模型，支持多张图片文字检测与识别。',
    displayName: 'Qianfan MultiPicOCR',
    id: 'qianfan-multipicocr',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 7.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'Qianfan VL 70B，大参数视觉语言模型，适用于复杂图文理解场景。',
    displayName: 'Qianfan VL 70B',
    id: 'qianfan-vl-70b',
    maxOutput: 28_672,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'Qianfan VL 8B，轻量视觉语言模型，适合日常图文问答和分析。',
    displayName: 'Qianfan VL 8B',
    id: 'qianfan-vl-8b',
    maxOutput: 28_672,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'Qianfan Llama VL 8B，基于 Llama 的多模态模型，面向通用图文理解任务。',
    displayName: 'Qianfan Llama VL 8B',
    id: 'qianfan-llama-vl-8b',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qianfan QI VL，多模态问答模型，支持复杂图文场景下的精准检索与问答。',
    displayName: 'Qianfan QI VL',
    id: 'qianfan-qi-vl',
    maxOutput: 131_072,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: 'Qianfan EngCard VL，专注英文场景的多模态识别模型。',
    displayName: 'Qianfan EngCard VL',
    id: 'qianfan-engcard-vl',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
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
    description: 'Qianfan SinglePicOCR，单图 OCR 模型，支持高精度字符识别。',
    displayName: 'Qianfan SinglePicOCR',
    id: 'qianfan-singlepicocr',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'InternVL3 38B，大规模多模态开源模型，适用于高精度图文理解任务。',
    displayName: 'InternVL3 38B',
    id: 'internvl3-38b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'InternVL3 14B，中等规模多模态模型，在性能与成本间取得平衡。',
    displayName: 'InternVL3 14B',
    id: 'internvl3-14b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'InternVL3 1B，轻量多模态模型，适合资源受限环境部署。',
    displayName: 'InternVL3 1B',
    id: 'internvl3-1b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'InternVL2.5 38B MPO，多模态预训练模型，支持复杂图文推理任务。',
    displayName: 'InternVL2.5 38B MPO',
    id: 'internvl2.5-38b-mpo',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 32B Instruct，多模态指令微调模型，适用于高质量图文问答与创作。',
    displayName: 'Qwen3 VL 32B Instruct',
    id: 'qwen3-vl-32b-instruct',
    maxOutput: 32_768,
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
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 32B Thinking，多模态深度思考版本，强化复杂推理与长链路分析。',
    displayName: 'Qwen3 VL 32B Thinking',
    id: 'qwen3-vl-32b-thinking',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 8B Instruct，轻量多模态模型，适合日常视觉问答与应用集成。',
    displayName: 'Qwen3 VL 8B Instruct',
    id: 'qwen3-vl-8b-instruct',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 8B Thinking，多模态思维链模型，适合对视觉信息进行细致推理。',
    displayName: 'Qwen3 VL 8B Thinking',
    id: 'qwen3-vl-8b-thinking',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 30B A3B Instruct，多模态大模型，兼顾精度与推理性能。',
    displayName: 'Qwen3 VL 30B A3B Instruct',
    id: 'qwen3-vl-30b-a3b-instruct',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 30B A3B Thinking，面向复杂多模态任务的深度思考版本。',
    displayName: 'Qwen3 VL 30B A3B Thinking',
    id: 'qwen3-vl-30b-a3b-thinking',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 7.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 235B A22B Instruct，旗舰多模态模型，面向高要求理解与创作场景。',
    displayName: 'Qwen3 VL 235B A22B Instruct',
    id: 'qwen3-vl-235b-a22b-instruct',
    maxOutput: 32_768,
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
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 VL 235B A22B Thinking，旗舰思考版，用于复杂多模态推理与规划任务。',
    displayName: 'Qwen3 VL 235B A22B Thinking',
    id: 'qwen3-vl-235b-a22b-thinking',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: 'Qwen2.5 VL 32B Instruct，多模态开源模型，适合私有化部署与多场景应用。',
    displayName: 'Qwen2.5 VL 32B Instruct',
    id: 'qwen2.5-vl-32b-instruct',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_384,
    description: 'Qwen2.5 VL 7B Instruct，轻量多模态模型，兼顾部署成本与识别能力。',
    displayName: 'Qwen2.5 VL 7B Instruct',
    id: 'qwen2.5-vl-7b-instruct',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 65_536,
    description: 'GLM-4.5V，多模态视觉语言模型，适用于通用图像理解与问答任务。',
    displayName: 'GLM-4.5V',
    id: 'glm-4.5v',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 0.032]': 2,
              '[0.032, 0.064]': 4,
            },
            pricingParams: ['textInput'],
          },
          name: 'textInput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 0.032]': 6,
              '[0.032, 0.064]': 12,
            },
            pricingParams: ['textInput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: 'DeepSeek VL2，多模态模型，支持图文理解与细粒度视觉问答。',
    displayName: 'DeepSeek VL2',
    id: 'deepseek-vl2',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.99, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: 'DeepSeek VL2 Small，轻量多模态版本，适用于资源受限与高并发场景。',
    displayName: 'DeepSeek VL2 Small',
    id: 'deepseek-vl2-small',
    maxOutput: 2048,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 65_536,
    description: 'ERNIE X1.1 Preview，ERNIE X1.1 思考模型预览版，适合能力验证与测试。',
    displayName: 'ERNIE X1.1 Preview',
    enabled: true,
    id: 'ernie-x1.1-preview',
    maxOutput: 65_536,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
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
    contextWindowTokens: 32_768,
    description: 'ERNIE X1 Turbo 32K，高速思考模型，32K 长上下文，适合复杂推理与多轮对话。',
    displayName: 'ERNIE X1 Turbo 32K',
    id: 'ernie-x1-turbo-32k',
    maxOutput: 28_160,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 144_000,
    description: 'DeepSeek V3.2 Think，满血版深度思考模型，强化长链路推理能力。',
    displayName: 'DeepSeek V3.2 Think',
    enabled: true,
    id: 'deepseek-v3.2-think',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 144_000,
    description:
      'DeepSeek V3.1 Think 250821，对应 Terminus 版本的深度思考模型，适用于高性能推理场景。',
    displayName: 'DeepSeek V3.1 Think 250821',
    id: 'deepseek-v3.1-think-250821',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 144_000,
    description: 'DeepSeek R1 250528，满血版 DeepSeek-R1 推理模型，适合高难度数学和逻辑任务。',
    displayName: 'DeepSeek R1 250528',
    id: 'deepseek-r1-250528',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 144_000,
    description: 'DeepSeek R1（当前 250120 版本），开放思维链输出的深度推理模型。',
    displayName: 'DeepSeek R1 250120',
    id: 'deepseek-r1',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 16, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek R1 Distill Qianfan 70B，基于 Qianfan-70B 的 R1 蒸馏模型，性价比高。',
    displayName: 'DeepSeek R1 Distill Qianfan 70B',
    id: 'deepseek-r1-distill-qianfan-70b',
    maxOutput: 8192,
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
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek R1 Distill Qianfan 8B，基于 Qianfan-8B 的 R1 蒸馏模型，适合中小型应用。',
    displayName: 'DeepSeek R1 Distill Qianfan 8B',
    id: 'deepseek-r1-distill-qianfan-8b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek R1 Distill Qianfan Llama 70B，基于 Llama-70B 的 R1 蒸馏模型。',
    displayName: 'DeepSeek R1 Distill Qianfan Llama 70B',
    id: 'deepseek-r1-distill-qianfan-llama-70b',
    maxOutput: 8192,
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
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek R1 Distill Llama 70B，通用 R1 推理能力与 Llama 生态结合的蒸馏模型。',
    displayName: 'DeepSeek R1 Distill Llama 70B',
    id: 'deepseek-r1-distill-llama-70b',
    maxOutput: 8192,
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
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek R1 Distill Qwen 32B，基于 Qwen-32B 的 R1 蒸馏模型，平衡性能与成本。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'deepseek-r1-distill-qwen-32b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek R1 Distill Qwen 14B，中等规模 R1 蒸馏模型，适合多场景部署。',
    displayName: 'DeepSeek R1 Distill Qwen 14B',
    id: 'deepseek-r1-distill-qwen-14b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2.4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek R1 Distill Qwen 7B，轻量级 R1 蒸馏模型，适合边缘与企业私有化环境。',
    displayName: 'DeepSeek R1 Distill Qwen 7B',
    id: 'deepseek-r1-distill-qwen-7b',
    maxOutput: 8192,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'DeepSeek R1 Distill Qwen 1.5B，超轻量 R1 蒸馏模型，适用于极低资源环境。',
    displayName: 'DeepSeek R1 Distill Qwen 1.5B',
    id: 'deepseek-r1-distill-qwen-1.5b',
    maxOutput: 8192,
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 Next 80B A3B Thinking，面向复杂任务的旗舰推理模型版本。',
    displayName: 'Qwen3 Next 80B A3B Thinking',
    id: 'qwen3-next-80b-a3b-thinking',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 235B A22B Thinking 2507，超大规模思考模型，适用于高难度推理。',
    displayName: 'Qwen3 235B A22B Thinking 2507',
    id: 'qwen3-235b-a22b-thinking-2507',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 20, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 30B A3B Thinking 2507，中大型思考模型，兼顾精度与成本。',
    displayName: 'Qwen3 30B A3B Thinking 2507',
    id: 'qwen3-30b-a3b-thinking-2507',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 7.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'QWQ-32B，大规模开源推理模型，适合作为 Agent 中的推理核心。',
    displayName: 'QWQ 32B',
    id: 'qwq-32b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 6, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Kimi K2 Instruct，Kimi 官方推理模型，支持长上下文与代码、问答等多场景。',
    displayName: 'Kimi K2 Instruct',
    id: 'kimi-k2-instruct',
    maxOutput: 32_768,
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
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 Coder 480B A35B Instruct，旗舰级代码模型，支持多语言编程与复杂代码理解。',
    displayName: 'Qwen3 Coder 480B A35B Instruct',
    id: 'qwen3-coder-480b-a35b-instruct',
    maxOutput: 65_536,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 0.032]': 6,
              '[0.032, 0.128]': 9,
            },
            pricingParams: ['textInput'],
          },
          name: 'textInput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 0.032]': 24,
              '[0.032, 0.128]': 36,
            },
            pricingParams: ['textInput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 235B A22B Instruct 2507，通用旗舰 Instruct 模型，适合多种生成与推理任务。',
    displayName: 'Qwen3 235B A22B Instruct 2507',
    id: 'qwen3-235b-a22b-instruct-2507',
    maxOutput: 32_768,
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
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description: 'Qwen3 30B A3B Instruct 2507，中大型 Instruct 模型，适合高质量生成与问答。',
    displayName: 'Qwen3 30B A3B Instruct 2507',
    id: 'qwen3-30b-a3b-instruct-2507',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen3 235B A22B，通用大模型，面向多种复杂任务。',
    displayName: 'Qwen3 235B A22B',
    id: 'qwen3-235b-a22b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen3 30B A3B，中大型通用模型，在成本与效果间平衡。',
    displayName: 'Qwen3 30B A3B',
    id: 'qwen3-30b-a3b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen3 32B，适合需要更强理解能力的通用任务场景。',
    displayName: 'Qwen3 32B',
    id: 'qwen3-32b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen3 14B，中型模型，适合多语言问答与文本生成。',
    displayName: 'Qwen3 14B',
    id: 'qwen3-14b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen3 8B，轻量模型，部署灵活，适用于高并发业务。',
    displayName: 'Qwen3 8B',
    id: 'qwen3-8b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen3 4B，适合中小型应用和本地推理场景。',
    displayName: 'Qwen3 4B',
    id: 'qwen3-4b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen3 1.7B，超轻量模型，便于边缘与终端部署。',
    displayName: 'Qwen3 1.7B',
    id: 'qwen3-1.7b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen3 0.6B，入门级模型，适用于简单推理和资源极度受限环境。',
    displayName: 'Qwen3 0.6B',
    id: 'qwen3-0.6b',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning', 'reasoningBudgetToken'],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'Qwen2.5 7B Instruct，成熟的开源指令模型，适用于多场景对话与生成。',
    displayName: 'Qwen2.5 7B Instruct',
    id: 'qwen2.5-7b-instruct',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 32_768,
    description: 'GLM-4 32B 0414，GLM 系列通用大模型版本，支持多任务文本生成与理解。',
    displayName: 'GLM-4 32B 0414',
    id: 'glm-4-32b-0414',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

const wenxinImageModels: AIImageModelCard[] = [
  {
    description: 'ERNIE iRAG，图像检索增强生成模型，支持以图搜图、图文检索与内容生成。',
    displayName: 'ERNIE iRAG',
    enabled: true,
    id: 'irag-1.0',
    parameters: {
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: [
          '768x768',
          '1024x1024',
          '1536x1536',
          '2048x2048',
          '1024x768',
          '2048x1536',
          '768x1024',
          '1536x2048',
          '1024x576',
          '2048x1152',
          '576x1024',
          '1152x2048',
        ],
      },
    },
    pricing: {
      currency: 'CNY',
      units: [{ name: 'imageGeneration', rate: 0.14, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2025-02-05',
    type: 'image',
  },
  {
    description: 'ERNIE iRAG Edit，支持图片擦除、重绘与变体生成的图像编辑模型。',
    displayName: 'ERNIE iRAG Edit',
    enabled: true,
    id: 'ernie-irag-edit',
    parameters: {
      imageUrl: { default: null },
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: [
          '768x768',
          '1024x1024',
          '1536x1536',
          '2048x2048',
          '1024x768',
          '2048x1536',
          '768x1024',
          '1536x2048',
          '1024x576',
          '2048x1152',
          '576x1024',
          '1152x2048',
        ],
      },
    },
    pricing: {
      currency: 'CNY',
      units: [{ name: 'imageGeneration', rate: 0.14, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2025-04-17',
    type: 'image',
  },
  {
    description: 'FLUX.1-schnell，高性能图像生成模型，适合快速生成多风格图片。',
    displayName: 'FLUX.1-schnell',
    enabled: true,
    id: 'flux.1-schnell',
    parameters: {
      prompt: {
        default: '',
      },
      seed: { default: null },
      size: {
        default: '1024x1024',
        enum: [
          '768x768',
          '1024x1024',
          '1536x1536',
          '2048x2048',
          '1024x768',
          '2048x1536',
          '768x1024',
          '1536x2048',
          '1024x576',
          '2048x1152',
          '576x1024',
          '1152x2048',
        ],
      },
      steps: { default: 25, max: 50, min: 1 },
    },
    pricing: {
      currency: 'CNY',
      units: [{ name: 'imageGeneration', rate: 0.002, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2025-03-27',
    type: 'image',
  },
];

export const allModels = [...wenxinChatModels, ...wenxinImageModels];

export default allModels;
