import { AIChatModelCard, AIImageModelCard } from '@/types/aiModel';

// https://docs.x.ai/docs/models
const xaiChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      reasoning: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 256_000,
    description:
      '我们最新最强大的旗舰模型，在自然语言处理、数学计算和推理方面表现卓越 —— 是一款完美的全能型选手。',
    displayName: 'Grok 4 0709',
    enabled: true,
    id: 'grok-4',
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-07-09',
    settings: {
      // reasoning_effort is not supported by grok-4. Specifying reasoning_effort parameter will get an error response.
      // extendParams: ['reasoningEffort'],
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
      '旗舰级模型，擅长数据提取、编程和文本摘要等企业级应用，拥有金融、医疗、法律和科学等领域的深厚知识。',
    displayName: 'Grok 3',
    id: 'grok-3',
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.75, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-03',
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
      '旗舰级模型，擅长数据提取、编程和文本摘要等企业级应用，拥有金融、医疗、法律和科学等领域的深厚知识。',
    displayName: 'Grok 3 (Fast mode)',
    id: 'grok-3-fast',
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 1.25, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 5, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 25, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-03',
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
    contextWindowTokens: 131_072,
    description:
      '轻量级模型，回话前会先思考。运行快速、智能，适用于不需要深层领域知识的逻辑任务，并能获取原始的思维轨迹。',
    displayName: 'Grok 3 Mini',
    enabled: true,
    id: 'grok-3-mini',
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.075, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.3, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.5, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-03',
    settings: {
      extendParams: ['reasoningEffort'],
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
      '轻量级模型，回话前会先思考。运行快速、智能，适用于不需要深层领域知识的逻辑任务，并能获取原始的思维轨迹。',
    displayName: 'Grok 3 Mini (Fast mode)',
    id: 'grok-3-mini-fast',
    pricing: {
      units: [
        { name: 'textInput_cacheRead', rate: 0.15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textInput', rate: 0.6, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 4, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2025-04-03',
    settings: {
      extendParams: ['reasoningEffort'],
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
    description: '该模型在准确性、指令遵循和多语言能力方面有所改进。',
    displayName: 'Grok 2 1212',
    id: 'grok-2-1212', // legacy
    pricing: {
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-12-12',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
      search: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description: '该模型在准确性、指令遵循和多语言能力方面有所改进。',
    displayName: 'Grok 2 Vision 1212',
    id: 'grok-2-vision-1212',
    pricing: {
      units: [
        { name: 'textInput', rate: 2, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 10, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    releasedAt: '2024-12-12',
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
];

const xaiImageModels: AIImageModelCard[] = [
  {
    description:
      '我们最新的图像生成模型可以根据文本提示生成生动逼真的图像。它在营销、社交媒体和娱乐等领域的图像生成方面表现出色。',
    displayName: 'Grok 2 Image 1212',
    enabled: true,
    id: 'grok-2-image-1212',
    parameters: {
      prompt: {
        default: '',
      },
    },
    releasedAt: '2024-12-12',
    type: 'image',
  },
];

export const allModels = [...xaiChatModels, ...xaiImageModels];

export default allModels;
