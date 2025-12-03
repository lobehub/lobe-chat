import { AIChatModelCard } from '../types/aiModel';

// https://docs.mistral.ai/getting-started/models/models_overview/
// https://mistral.ai/pricing#api-pricing

const mistralChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Mistral Large 3 是一款最先进的开放权重通用多模态模型，采用精细的混合专家架构。它具有41B活跃参数和675B总参数。',
    displayName: 'Mistral Large 3',
    enabled: true,
    id: 'mistral-large-2512',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-02',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Mistral Medium 3 以 8 倍的成本提供最先进的性能，并从根本上简化了企业部署。',
    displayName: 'Mistral Medium 3.1',
    enabled: true,
    id: 'mistral-medium-2508',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.4, strategy: 'fixed', unit: 'millionTokens' },
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
    contextWindowTokens: 131_072,
    description: 'Magistral Medium 1.2 是Mistral AI于2025年9月发布的前沿级推理模型，具有视觉支持。',
    displayName: 'Magistral Medium 1.2',
    enabled: true,
    id: 'magistral-medium-2509',
    pricing: {
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Magistral Small 1.2 是Mistral AI于2025年9月发布的开源小型推理模型，具有视觉支持。',
    displayName: 'Magistral Small 1.2',
    id: 'magistral-small-2509',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 1.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Mistral Nemo是一个与Nvidia合作开发的12B模型，提供出色的推理和编码性能，易于集成和替换。',
    displayName: 'Mistral Nemo',
    id: 'open-mistral-nemo',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description: 'Mistral Small是成本效益高、快速且可靠的选项，适用于翻译、摘要和情感分析等用例。',
    displayName: 'Mistral Small 3.2',
    id: 'mistral-small-2506',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Mistral Large是旗舰大模型，擅长多语言任务、复杂推理和代码生成，是高端应用的理想选择。',
    displayName: 'Mistral Large 2.1',
    id: 'mistral-large-2411',
    pricing: {
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
    contextWindowTokens: 262_144,
    description:
      'Codestral 是我们最先进的编码语言模型，第二个版本于2025年1月发布，专门从事低延迟、高频任务如中间填充（RST）、代码纠正和测试生成。',
    displayName: 'Codestral 2508',
    id: 'codestral-2508',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.9, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-07-30',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Pixtral Large 是一款拥有 1240 亿参数的开源多模态模型，基于 Mistral Large 2 构建。这是我们多模态家族中的第二款模型，展现了前沿水平的图像理解能力。',
    displayName: 'Pixtral Large',
    id: 'pixtral-large-2411',
    pricing: {
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
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Pixtral 模型在图表和图理解、文档问答、多模态推理和指令遵循等任务上表现出强大的能力，能够以自然分辨率和宽高比摄入图像，还能够在长达 128K 令牌的长上下文窗口中处理任意数量的图像。',
    displayName: 'Pixtral 12B',
    id: 'pixtral-12b-2409',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Ministral 3 3B 是 Ministral 3 系列中最小的、最有效的模型，提供强大的语言和视觉能力在一个紧凑的包中。专为边缘部署设计，它在包括本地设置在内的各种硬件上提供高性能。',
    displayName: 'Ministral 3 3B',
    id: 'ministral-3b-2512',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.1, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-02',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Ministral 3 8B 是 Ministral 3 系列中的强大且有效的模型，提供一流的文本和视觉能力。专为边缘部署构建，它在包括本地设置在内的各种硬件上提供高性能。',
    displayName: 'Ministral 3 8B',
    id: 'ministral-8b-2512',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-02',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 262_144,
    description:
      'Ministral 3 14B 是 Ministral 3 系列中最大的模型，提供最先进的性能和与其更大的 Mistral Small 3.2 24B 对应模型相当的性能。针对本地部署优化，它在包括本地设置在内的各种硬件上提供高性能。',
    displayName: 'Ministral 3 14B',
    id: 'ministral-14b-2512',
    pricing: {
      units: [
        { name: 'textInput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.2, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-12-02',
    type: 'chat',
  },
  {
    contextWindowTokens: 262_144,
    description:
      'Codestral Mamba是专注于代码生成的Mamba 2语言模型，为先进的代码和推理任务提供强力支持。',
    displayName: 'Codestral Mamba',
    id: 'open-codestral-mamba',
    pricing: {
      units: [
        { name: 'textInput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...mistralChatModels];

export default allModels;
