import { ModelProviderCard } from '@/types/llm';

// ref https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Nlks5zkzu
const BaiduWenxin: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 8192,
      description:
        '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
      displayName: 'ERNIE 3.5 8K',
      enabled: true,
      functionCall: true,
      id: 'ernie-3.5-8k',
      pricing: {
        currency: 'CNY',
        input: 0.8,
        output: 2,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
      displayName: 'ERNIE 3.5 8K Preview',
      functionCall: true,
      id: 'ernie-3.5-8k-preview',
      pricing: {
        currency: 'CNY',
        input: 0.8,
        output: 2,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        '百度自研的旗舰级大规模⼤语⾔模型，覆盖海量中英文语料，具有强大的通用能力，可满足绝大部分对话问答、创作生成、插件应用场景要求；支持自动对接百度搜索插件，保障问答信息时效。',
      displayName: 'ERNIE 3.5 128K',
      enabled: true,
      functionCall: true,
      id: 'ernie-3.5-128k',
      pricing: {
        currency: 'CNY',
        input: 0.8,
        output: 2,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        '百度自研的旗舰级超大规模⼤语⾔模型，相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。',
      displayName: 'ERNIE 4.0 8K',
      enabled: true,
      functionCall: true,
      id: 'ernie-4.0-8k-latest',
      pricing: {
        currency: 'CNY',
        input: 30,
        output: 90,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        '百度自研的旗舰级超大规模⼤语⾔模型，相较ERNIE 3.5实现了模型能力全面升级，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。',
      displayName: 'ERNIE 4.0 8K Preview',
      functionCall: true,
      id: 'ernie-4.0-8k-preview',
      pricing: {
        currency: 'CNY',
        input: 30,
        output: 90,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
      displayName: 'ERNIE 4.0 Turbo 8K',
      enabled: true,
      functionCall: true,
      id: 'ernie-4.0-turbo-8k-latest',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 60,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
      displayName: 'ERNIE 4.0 Turbo 128K',
      enabled: true,
      functionCall: true,
      id: 'ernie-4.0-turbo-128k',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 60,
      },
    },
    {
      contextWindowTokens: 8192,
      description:
        '百度自研的旗舰级超大规模⼤语⾔模型，综合效果表现出色，广泛适用于各领域复杂任务场景；支持自动对接百度搜索插件，保障问答信息时效。相较于ERNIE 4.0在性能表现上更优秀',
      displayName: 'ERNIE 4.0 Turbo 8K Preview',
      functionCall: true,
      id: 'ernie-4.0-turbo-8k-preview',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 60,
      },
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
    },
    {
      contextWindowTokens: 128_000,
      description:
        '百度自研的轻量级大语言模型，兼顾优异的模型效果与推理性能，效果比ERNIE Lite更优，适合低算力AI加速卡推理使用。',
      displayName: 'ERNIE Lite Pro 128K',
      functionCall: true,
      id: 'ernie-lite-pro-128k',
      pricing: {
        currency: 'CNY',
        input: 0.2,
        output: 0.4,
      },
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
    },
    {
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
    },
  ],
  checkModel: 'ernie-speed-128k',
  description:
    '企业级一站式大模型与AI原生应用开发及服务平台，提供最全面易用的生成式人工智能模型开发、应用开发全流程工具链',
  id: 'wenxin',
  modelsUrl: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Nlks5zkzu#%E5%AF%B9%E8%AF%9Dchat',
  name: 'Wenxin',
  settings: {
    sdkType: 'openai',
    smoothing: {
      speed: 2,
      text: true,
    },
  },
  smoothing: {
    speed: 2,
    text: true,
  },
  url: 'https://cloud.baidu.com/wenxin.html',
};

export default BaiduWenxin;
