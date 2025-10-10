import { AIChatModelCard, AIImageModelCard } from '../types/aiModel';

// price: https://bigmodel.cn/pricing
// ref: https://docs.bigmodel.cn/cn/guide/start/model-overview

const zhipuChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 200_000,
    description:
      '智谱最新旗舰模型 GLM-4.6 (355B) 在高级编码、长文本处理、推理与智能体能力上全面超越前代，尤其在编程能力上对齐 Claude Sonnet 4，成为国内顶尖的 Coding 模型。',
    displayName: 'GLM-4.6',
    enabled: true,
    id: 'glm-4.6',
    maxOutput: 131_072,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 32_000]_[0, 200]': 0.4,
              '[0, 32_000]_[200, infinity]': 0.6,
              '[32_000, 200_000]': 0.8,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textInput_cacheRead',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]_[0, 200]': 2,
              '[0, 32_000]_[200, infinity]': 3,
              '[32_000, 200_000]': 4,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textInput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]_[0, 200]': 8,
              '[0, 32_000]_[200, infinity]': 14,
              '[32_000, 200_000]': 16,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 65_536,
    description:
      '智谱新一代基于 MOE 架构的视觉推理模型，以106B的总参数量和12B激活参数量，在各类基准测试中达到全球同级别开源多模态模型 SOTA，涵盖图像、视频、文档理解及 GUI 任务等常见任务。',
    displayName: 'GLM-4.5V',
    enabled: true,
    id: 'glm-4.5v',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 32_000]': 0.4,
              '[32_000, 65_536]': 0.8,
            },
            pricingParams: ['textInput'],
          },
          name: 'textInput_cacheRead',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]': 2,
              '[32_000, 65_536]': 4,
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
              '[0, 32_000]': 6,
              '[32_000, 65_536]': 12,
            },
            pricingParams: ['textInput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
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
    contextWindowTokens: 131_072,
    description:
      '智谱旗舰模型，支持思考模式切换，综合能力达到开源模型的 SOTA 水平，上下文长度可达128K。',
    displayName: 'GLM-4.5',
    id: 'glm-4.5',
    maxOutput: 98_304,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 32_000]_[0, 200]': 0.4,
              '[0, 32_000]_[200, infinity]': 0.6,
              '[32_000, 128_000]': 0.8,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textInput_cacheRead',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]_[0, 200]': 2,
              '[0, 32_000]_[200, infinity]': 3,
              '[32_000, 128_000]': 4,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textInput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]_[0, 200]': 8,
              '[0, 32_000]_[200, infinity]': 14,
              '[32_000, 128_000]': 16,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
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
    contextWindowTokens: 131_072,
    description: 'GLM-4.5 的极速版，在性能强劲的同时，生成速度可达 100 tokens/秒。',
    displayName: 'GLM-4.5-X',
    id: 'glm-4.5-x',
    maxOutput: 98_304,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 32_000]': 1.6,
              '[0, 32_000]_[200, infinity]': 2.4,
              '[32_000, 128_000]': 3.2,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textInput_cacheRead',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]_[0, 200]': 8,
              '[0, 32_000]_[200, infinity]': 12,
              '[32_000, 128_000]': 16,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textInput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]_[0, 200]': 16,
              '[0, 32_000]_[200, infinity]': 32,
              '[32_000, 128_000]': 64,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
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
    contextWindowTokens: 131_072,
    description: 'GLM-4.5 的轻量版，兼顾性能与性价比，可灵活切换混合思考模型。',
    displayName: 'GLM-4.5-Air',
    id: 'glm-4.5-air',
    maxOutput: 98_304,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 32_000]': 0.16,
              '[32_000, 128_000]': 0.24,
            },
            pricingParams: ['textInput'],
          },
          name: 'textInput_cacheRead',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]': 0.8,
              '[32_000, 128_000]': 1.2,
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
              '[0, 32_000]_[0, 200]': 2,
              '[0, 32_000]_[200, infinity]': 6,
              '[32_000, 128_000]': 8,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
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
    contextWindowTokens: 131_072,
    description: 'GLM-4.5-Air 的极速版，响应速度更快，专为大规模高速度需求打造。',
    displayName: 'GLM-4.5-AirX',
    id: 'glm-4.5-airx',
    maxOutput: 98_304,
    pricing: {
      currency: 'CNY',
      units: [
        {
          lookup: {
            prices: {
              '[0, 32_000]': 0.8,
              '[32_000, 128_000]': 1.6,
            },
            pricingParams: ['textInput'],
          },
          name: 'textInput_cacheRead',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
        {
          lookup: {
            prices: {
              '[0, 32_000]': 4,
              '[32_000, 128_000]': 8,
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
              '[0, 32_000]_[0, 200]': 12,
              '[0, 32_000]_[200, infinity]': 16,
              '[32_000, 128_000]': 32,
            },
            pricingParams: ['textInput', 'textOutput'],
          },
          name: 'textOutput',
          strategy: 'lookup',
          unit: 'millionTokens',
        },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
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
    contextWindowTokens: 131_072,
    description: 'GLM-4.5 的免费版，推理、代码、智能体等任务表现出色。',
    displayName: 'GLM-4.5-Flash',
    enabled: true,
    id: 'glm-4.5-flash',
    maxOutput: 98_304,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput_cacheRead', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      extendParams: ['enableReasoning'],
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 65_536,
    description:
      'GLM-4.1V-Thinking 系列模型是目前已知10B级别的VLM模型中性能最强的视觉模型，融合了同级别SOTA的各项视觉语言任务，包括视频理解、图片问答、学科解题、OCR文字识别、文档和图表解读、GUI Agent、前端网页Coding、Grounding等，多项任务能力甚至超过8倍参数量的Qwen2.5-VL-72B。通过领先的强化学习技术，模型掌握了通过思维链推理的方式提升回答的准确性和丰富度，从最终效果和可解释性等维度都显著超过传统的非thinking模型。',
    displayName: 'GLM-4.1V-Thinking-FlashX',
    id: 'glm-4.1v-thinking-flashx',
    maxOutput: 32_768,
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
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 65_536,
    description:
      'GLM-4.1V-Thinking 系列模型是目前已知10B级别的VLM模型中性能最强的视觉模型，融合了同级别SOTA的各项视觉语言任务，包括视频理解、图片问答、学科解题、OCR文字识别、文档和图表解读、GUI Agent、前端网页Coding、Grounding等，多项任务能力甚至超过8倍参数量的Qwen2.5-VL-72B。通过领先的强化学习技术，模型掌握了通过思维链推理的方式提升回答的准确性和丰富度，从最终效果和可解释性等维度都显著超过传统的非thinking模型。',
    displayName: 'GLM-4.1V-Thinking-Flash',
    id: 'glm-4.1v-thinking-flash',
    maxOutput: 32_768,
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
      reasoning: true,
    },
    contextWindowTokens: 16_384,
    description: 'GLM-Zero-Preview具备强大的复杂推理能力，在逻辑推理、数学、编程等领域表现优异。',
    displayName: 'GLM-Zero-Preview',
    id: 'glm-zero-preview',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      search: true,
    },
    contextWindowTokens: 131_072,
    description: '推理模型: 具备强大推理能力，适用于需要深度推理的任务。',
    displayName: 'GLM-Z1-Air',
    id: 'glm-z1-air',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
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
    description: '极速推理：具有超快的推理速度和强大的推理效果。',
    displayName: 'GLM-Z1-AirX',
    id: 'glm-z1-airx',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
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
    contextWindowTokens: 131_072,
    description: '高速低价：Flash增强版本，超快推理速度，更快并发保障。',
    displayName: 'GLM-Z1-FlashX',
    id: 'glm-z1-flashx',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
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
    contextWindowTokens: 131_072,
    description: 'GLM-Z1 系列具备强大的复杂推理能力，在逻辑推理、数学、编程等领域表现优异。',
    displayName: 'GLM-Z1-Flash',
    id: 'glm-z1-flash',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
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
    description: 'GLM-4-Flash 是处理简单任务的理想选择，速度最快且免费。',
    displayName: 'GLM-4-Flash-250414',
    id: 'glm-4-flash-250414',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
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
    description: 'GLM-4-FlashX 是Flash的增强版本，超快推理速度。',
    displayName: 'GLM-4-FlashX-250414',
    id: 'glm-4-flashx',
    maxOutput: 4095,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
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
    contextWindowTokens: 1_024_000,
    description: 'GLM-4-Long 支持超长文本输入，适合记忆型任务与大规模文档处理。',
    displayName: 'GLM-4-Long',
    id: 'glm-4-long',
    maxOutput: 4095,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
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
    description: 'GLM-4-Air 是性价比高的版本，性能接近GLM-4，提供快速度和实惠的价格。',
    displayName: 'GLM-4-Air-250414',
    id: 'glm-4-air-250414',
    maxOutput: 16_384,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
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
    contextWindowTokens: 8192,
    description: 'GLM-4-AirX 提供 GLM-4-Air 的高效版本，推理速度可达其2.6倍。',
    displayName: 'GLM-4-AirX',
    id: 'glm-4-airx',
    maxOutput: 4095,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
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
    description: 'GLM-4-Plus 作为高智能旗舰，具备强大的处理长文本和复杂任务的能力，性能全面提升。',
    displayName: 'GLM-4-Plus',
    id: 'glm-4-plus',
    maxOutput: 4095,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
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
    description: 'GLM-4-0520 是最新模型版本，专为高度复杂和多样化任务设计，表现卓越。',
    displayName: 'GLM-4-0520',
    id: 'glm-4-0520', // 弃用时间 2025年12月30日
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 100, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 100, strategy: 'fixed', unit: 'millionTokens' },
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
    contextWindowTokens: 4096,
    description:
      'GLM-4V-Flash 专注于高效的单一图像理解，适用于快速图像解析的场景，例如实时图像分析或批量图像处理。',
    displayName: 'GLM-4V-Flash',
    id: 'glm-4v-flash',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-12-09',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 16_000,
    description: 'GLM-4V-Plus 具备对视频内容及多图片的理解能力，适合多模态任务。',
    displayName: 'GLM-4V-Plus-0111',
    id: 'glm-4v-plus-0111',
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 4096,
    description: 'GLM-4V 提供强大的图像理解与推理能力，支持多种视觉任务。',
    displayName: 'GLM-4V',
    id: 'glm-4v',
    maxOutput: 1024,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 50, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 50, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description:
      'CodeGeeX-4 是强大的AI编程助手，支持多种编程语言的智能问答与代码补全，提升开发效率。',
    displayName: 'CodeGeeX-4',
    id: 'codegeex-4',
    maxOutput: 32_768,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'CharGLM-4 专为角色扮演与情感陪伴设计，支持超长多轮记忆与个性化对话，应用广泛。',
    displayName: 'CharGLM-4',
    id: 'charglm-4',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description: 'Emohaa 是心理模型，具备专业咨询能力，帮助用户理解情感问题。',
    displayName: 'Emohaa',
    id: 'emohaa',
    maxOutput: 4000,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

const zhipuImageModels: AIImageModelCard[] = [
  // https://bigmodel.cn/dev/api/image-model/cogview
  {
    description:
      'CogView-4 是智谱首个支持生成汉字的开源文生图模型，在语义理解、图像生成质量、中英文字生成能力等方面全面提升，支持任意长度的中英双语输入，能够生成在给定范围内的任意分辨率图像。',
    displayName: 'CogView-4',
    enabled: true,
    id: 'cogview-4',
    parameters: {
      prompt: {
        default: '',
      },
      size: {
        default: '1024x1024',
        enum: ['1024x1024', '768x1344', '864x1152', '1344x768', '1152x864', '1440x720', '720x1440'],
      },
    },
    pricing: {
      currency: 'CNY',
      units: [{ name: 'imageGeneration', rate: 0.06, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2025-03-04',
    type: 'image',
  },
];

export const allModels = [...zhipuChatModels, ...zhipuImageModels];

export default allModels;
