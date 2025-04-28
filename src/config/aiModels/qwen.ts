import { AIChatModelCard } from '@/types/aiModel';

// https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-api#e1fada1a719u7

const qwenChatModels: AIChatModelCard[] = [
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      '基于 Qwen2.5 模型训练的 QwQ 推理模型，通过强化学习大幅度提升了模型推理能力。模型数学代码等核心指标（AIME 24/25、LiveCodeBench）以及部分通用指标（IFEval、LiveBench等）达到DeepSeek-R1 满血版水平。',
    displayName: 'QwQ Plus',
    enabled: true,
    id: 'qwq-plus-latest',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 1.6,
      output: 4,
    },
    releasedAt: '2025-03-06',
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
    contextWindowTokens: 1_000_000,
    description: '通义千问超大规模语言模型，支持中文、英文等不同语言输入。',
    displayName: 'Qwen Turbo',
    enabled: true,
    id: 'qwen-turbo-latest',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 0.3,
      output: 0.6,
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
    description: '通义千问超大规模语言模型增强版，支持中文、英文等不同语言输入。',
    displayName: 'Qwen Plus',
    enabled: true,
    id: 'qwen-plus-latest',
    maxOutput: 8192,
    organization: 'Qwen',
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
    contextWindowTokens: 32_768,
    description:
      '通义千问千亿级别超大规模语言模型，支持中文、英文等不同语言输入，当前通义千问2.5产品版本背后的API模型。',
    displayName: 'Qwen Max',
    enabled: true,
    id: 'qwen-max-latest',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 2.4,
      output: 9.6,
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 1_000_000,
    description:
      '通义千问超大规模语言模型，支持长文本上下文，以及基于长文档、多文档等多个场景的对话功能。',
    displayName: 'Qwen Long',
    enabled: true,
    id: 'qwen-long',
    maxOutput: 6000,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 0.5,
      output: 2,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen-Omni 系列模型支持输入多种模态的数据，包括视频、音频、图片、文本，并输出音频与文本。',
    displayName: 'Qwen Omni Turbo',
    enabled: true,
    id: 'qwen-omni-turbo-latest',
    maxOutput: 2048,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 1.5, // use image input price
      output: 4.5,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'Qwen-Omni 系列模型支持输入多种模态的数据，包括视频、音频、图片、文本，并输出音频与文本。',
    displayName: 'Qwen2.5 Omni 7B',
    id: 'qwen2.5-omni-7b',
    maxOutput: 2048,
    organization: 'Qwen',
    // pricing: {
    //   currency: 'CNY',
    //   input: 0,
    //   output: 0,
    // },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_000,
    description:
      '通义千问大规模视觉语言模型增强版。大幅提升细节识别能力和文字识别能力，支持超百万像素分辨率和任意长宽比规格的图像。',
    displayName: 'Qwen VL Plus',
    id: 'qwen-vl-plus-latest',
    maxOutput: 2048,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 1.5,
      output: 4.5,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      '通义千问超大规模视觉语言模型。相比增强版，再次提升视觉推理能力和指令遵循能力，提供更高的视觉感知和认知水平。',
    displayName: 'Qwen VL Max',
    enabled: true,
    id: 'qwen-vl-max-latest',
    maxOutput: 2048,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 3,
      output: 9,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 34_096,
    description:
      '通义千问OCR是文字提取专有模型，专注于文档、表格、试题、手写体文字等类型图像的文字提取能力。它能够识别多种文字，目前支持的语言有：汉语、英语、法语、日语、韩语、德语、俄语、意大利语、越南语、阿拉伯语。',
    displayName: 'Qwen VL OCR',
    id: 'qwen-vl-ocr-latest',
    maxOutput: 4096,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 5,
      output: 5,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: '通义千问数学模型是专门用于数学解题的语言模型。',
    displayName: 'Qwen Math Turbo',
    id: 'qwen-math-turbo-latest',
    maxOutput: 3072,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 6,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: '通义千问数学模型是专门用于数学解题的语言模型。',
    displayName: 'Qwen Math Plus',
    id: 'qwen-math-plus-latest',
    maxOutput: 3072,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 12,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '通义千问代码模型。',
    displayName: 'Qwen Coder Turbo',
    id: 'qwen-coder-turbo-latest',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 6,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '通义千问代码模型。',
    displayName: 'Qwen Coder Plus',
    id: 'qwen-coder-plus-latest',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 3.5,
      output: 7,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 131_072,
    description:
      '基于 Qwen2.5-32B 模型训练的 QwQ 推理模型，通过强化学习大幅度提升了模型推理能力。模型数学代码等核心指标（AIME 24/25、LiveCodeBench）以及部分通用指标（IFEval、LiveBench等）达到DeepSeek-R1 满血版水平，各指标均显著超过同样基于 Qwen2.5-32B 的 DeepSeek-R1-Distill-Qwen-32B。',
    displayName: 'QwQ 32B',
    id: 'qwq-32b',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 6,
    },
    releasedAt: '2025-03-06',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description: 'QwQ模型是由 Qwen 团队开发的实验性研究模型，专注于增强 AI 推理能力。',
    displayName: 'QwQ 32B Preview',
    id: 'qwq-32b-preview',
    maxOutput: 16_384,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 6,
    },
    releasedAt: '2024-11-28',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 122_880,
    description:
      '通义千问QVQ视觉推理模型，支持视觉输入及思维链输出，在数学、编程、视觉分析、创作以及通用任务上都表现了更强的能力。',
    displayName: 'QVQ Max',
    id: 'qvq-max', // Unsupported model `qvq-max-latest` for OpenAI compatibility mode
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 8,
      output: 32,
    },
    releasedAt: '2025-03-25',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    description:
      'QVQ模型是由 Qwen 团队开发的实验性研究模型，专注于提升视觉推理能力，尤其在数学推理领域。',
    displayName: 'QVQ 72B Preview',
    id: 'qvq-72b-preview',
    maxOutput: 16_384,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 12,
      output: 36,
    },
    releasedAt: '2024-12-25',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '通义千问2.5对外开源的7B规模的模型。',
    displayName: 'Qwen2.5 7B',
    id: 'qwen2.5-7b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 0.5,
      output: 1,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '通义千问2.5对外开源的14B规模的模型。',
    displayName: 'Qwen2.5 14B',
    id: 'qwen2.5-14b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 3,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '通义千问2.5对外开源的32B规模的模型。',
    displayName: 'Qwen2.5 32B',
    id: 'qwen2.5-32b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 3.5,
      output: 7,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 131_072,
    description: '通义千问2.5对外开源的72B规模的模型。',
    displayName: 'Qwen2.5 72B',
    id: 'qwen2.5-72b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 12,
    },
    type: 'chat',
  },
  {
    abilities: {
      functionCall: true,
    },
    contextWindowTokens: 1_000_000,
    description: '通义千问2.5对外开源的72B规模的模型。',
    displayName: 'Qwen2.5 14B 1M',
    id: 'qwen2.5-14b-instruct-1m',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 3,
    },
    releasedAt: '2025-01-27',
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: 'Qwen-Math 模型具有强大的数学解题能力。',
    displayName: 'Qwen2.5 Math 7B',
    id: 'qwen2.5-math-7b-instruct',
    maxOutput: 3072,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 4096,
    description: 'Qwen-Math 模型具有强大的数学解题能力。',
    displayName: 'Qwen2.5 Math 72B',
    id: 'qwen2.5-math-72b-instruct',
    maxOutput: 3072,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 12,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '通义千问代码模型开源版。',
    displayName: 'Qwen2.5 Coder 7B',
    id: 'qwen2.5-coder-7b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 2,
    },
    type: 'chat',
  },
  {
    contextWindowTokens: 131_072,
    description: '通义千问代码模型开源版。',
    displayName: 'Qwen2.5 Coder 32B',
    id: 'qwen2.5-coder-32b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 3.5,
      output: 7,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 8000,
    description: '以 Qwen-7B 语言模型初始化，添加图像模型，图像输入分辨率为448的预训练模型。',
    displayName: 'Qwen VL',
    id: 'qwen-vl-v1',
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 8000,
    description: '通义千问VL支持灵活的交互方式，包括多图、多轮问答、创作等能力的模型。',
    displayName: 'Qwen VL Chat',
    id: 'qwen-vl-chat-v1',
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      '指令跟随、数学、解题、代码整体提升，万物识别能力提升，支持多样格式直接精准定位视觉元素，支持对长视频文件（最长10分钟）进行理解和秒级别的事件时刻定位，能理解时间先后和快慢，基于解析和定位能力支持操控OS或Mobile的Agent，关键信息抽取能力和Json格式输出能力强，此版本为72B版本，本系列能力最强的版本。',
    displayName: 'Qwen2.5 VL 72B',
    id: 'qwen2.5-vl-72b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 16,
      output: 48,
    },
    releasedAt: '2025-01-27',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      'Qwen2.5VL系列模型，在math和学科问题解答达到了接近Qwen2.5VL-72B的水平，回复风格面向人类偏好进行大幅调整，尤其是数学、逻辑推理、知识问答等客观类query，模型回复详实程度和格式清晰度明显改善。此版本为32B版本。',
    displayName: 'Qwen2.5 VL 32B',
    id: 'qwen2.5-vl-32b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 8,
      output: 24,
    },
    releasedAt: '2025-03-24',
    type: 'chat',
  },
  {
    abilities: {
      vision: true,
    },
    contextWindowTokens: 131_072,
    description:
      '指令跟随、数学、解题、代码整体提升，万物识别能力提升，支持多样格式直接精准定位视觉元素，支持对长视频文件（最长10分钟）进行理解和秒级别的事件时刻定位，能理解时间先后和快慢，基于解析和定位能力支持操控OS或Mobile的Agent，关键信息抽取能力和Json格式输出能力强，此版本为72B版本，本系列能力最强的版本。',
    displayName: 'Qwen2.5 VL 7B',
    id: 'qwen2.5-vl-7b-instruct',
    maxOutput: 8192,
    organization: 'Qwen',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 5,
    },
    releasedAt: '2025-01-27',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 65_792,
    description:
      'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。在数学、代码、自然语言推理等任务上，性能较高，能力较强。',
    displayName: 'DeepSeek R1',
    id: 'deepseek-r1',
    maxOutput: 8192,
    organization: 'DeepSeek',
    pricing: {
      currency: 'CNY',
      input: 4,
      output: 16,
    },
    releasedAt: '2025-01-27',
    type: 'chat',
  },
  {
    contextWindowTokens: 65_792,
    description:
      'DeepSeek-V3 为自研 MoE 模型，671B 参数，激活 37B，在 14.8T token 上进行了预训练，在长文本、代码、数学、百科、中文能力上表现优秀。',
    displayName: 'DeepSeek V3',
    id: 'deepseek-v3',
    maxOutput: 8192,
    organization: 'DeepSeek',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 8,
    },
    releasedAt: '2025-01-27',
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill-Qwen-1.5B 是一个基于 Qwen2.5-Math-1.5B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
    displayName: 'DeepSeek R1 Distill Qwen 1.5B',
    id: 'deepseek-r1-distill-qwen-1.5b',
    maxOutput: 16_384,
    organization: 'DeepSeek',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill-Qwen-7B 是一个基于 Qwen2.5-Math-7B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
    displayName: 'DeepSeek R1 Distill Qwen 7B',
    id: 'deepseek-r1-distill-qwen-7b',
    maxOutput: 16_384,
    organization: 'DeepSeek',
    pricing: {
      currency: 'CNY',
      input: 0.5,
      output: 1,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill-Qwen-14B 是一个基于 Qwen2.5-14B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
    displayName: 'DeepSeek R1 Distill Qwen 14B',
    id: 'deepseek-r1-distill-qwen-14b',
    maxOutput: 16_384,
    organization: 'DeepSeek',
    pricing: {
      currency: 'CNY',
      input: 1,
      output: 3,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill-Qwen-32B 是一个基于 Qwen2.5-32B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
    displayName: 'DeepSeek R1 Distill Qwen 32B',
    id: 'deepseek-r1-distill-qwen-32b',
    maxOutput: 16_384,
    organization: 'DeepSeek',
    pricing: {
      currency: 'CNY',
      input: 2,
      output: 6,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill-Llama-8B 是一个基于 Llama-3.1-8B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
    displayName: 'DeepSeek R1 Distill Llama 8B',
    id: 'deepseek-r1-distill-llama-8b',
    maxOutput: 16_384,
    organization: 'DeepSeek',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
  {
    abilities: {
      reasoning: true,
    },
    contextWindowTokens: 32_768,
    description:
      'DeepSeek-R1-Distill-Llama-70B 是一个基于 Llama-3.3-70B-Instruct 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
    displayName: 'DeepSeek R1 Distill Llama 70B',
    id: 'deepseek-r1-distill-llama-70b',
    maxOutput: 16_384,
    organization: 'DeepSeek',
    pricing: {
      currency: 'CNY',
      input: 0,
      output: 0,
    },
    type: 'chat',
  },
];

export const allModels = [...qwenChatModels];

export default allModels;
