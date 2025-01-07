import { AIChatModelCard } from '@/types/aiModel';

const wenxinChatModels: AIChatModelCard[] = [
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 3.5 8K',
    enabled: true,
    id: 'ERNIE-3.5-8K',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 3.5 8K Preview',
    id: 'ERNIE-3.5-8K-Preview',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 3.5 128K',
    enabled: true,
    id: 'ERNIE-3.5-128K',
    pricing: {
      currency: 'CNY',
      input: 0.8,
      output: 2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 4.0 8K',
    enabled: true,
    id: 'ERNIE-4.0-8K-Latest',
    pricing: {
      currency: 'CNY',
      input: 30,
      output: 90,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。',
    displayName: 'ERNIE 4.0 8K Preview',
    id: 'ERNIE-4.0-8K-Preview',
    pricing: {
      currency: 'CNY',
      input: 30,
      output: 90,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
    displayName: 'ERNIE 4.0 Turbo 8K',
    enabled: true,
    id: 'ERNIE-4.0-Turbo-8K-Latest',
    pricing: {
      currency: 'CNY',
      input: 20,
      output: 60,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
    displayName: 'ERNIE 4.0 Turbo 128K',
    enabled: true,
    id: 'ERNIE-4.0-Turbo-128K',
    pricing: {
      currency: 'CNY',
      input: 20,
      output: 60,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
    displayName: 'ERNIE 4.0 Turbo 8K Preview',
    id: 'ERNIE-4.0-Turbo-8K-Preview',
    pricing: {
      currency: 'CNY',
      input: 20,
      output: 60,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '百度自研的轻量级大语言模型，兼顾优异的模型效果与推理性能，效果比ERNIE Lite更优，适合低算力AI加速卡推理使用。',
    displayName: 'ERNIE Lite Pro 128K',
    enabled: true,
    id: 'ERNIE-Lite-Pro-128K',
    pricing: {
      currency: 'CNY',
      input: 0.2,
      output: 0.4,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '百度2024年最新发布的自研高性能大语言模型，通用能力优异，效果比ERNIE Speed更优，适合作为基座模型进行精调，更好地处理特定场景问题，同时具备极佳的推理性能。',
    displayName: 'ERNIE Speed Pro 128K',
    enabled: true,
    id: 'ERNIE-Speed-Pro-128K',
    pricing: {
      currency: 'CNY',
      input: 0.3,
      output: 0.6,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 128_000,
    description:
      '百度2024年最新发布的自研高性能大语言模型，通用能力优异，适合作为基座模型进行精调，更好地处理特定场景问题，同时具备极佳的推理性能。',
    displayName: 'ERNIE Speed 128K',
    id: 'ERNIE-Speed-128K',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 8192,
    description:
      '百度自研的垂直场景大语言模型，适合游戏NPC、客服对话、对话角色扮演等应用场景，人设风格更为鲜明、一致，指令遵循能力更强，推理性能更优。',
    displayName: 'ERNIE Character 8K',
    id: 'ERNIE-Character-8K',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 8,
    },
    type: 'chat',
  },
];

export const allModels = [...wenxinChatModels];

export default allModels;
