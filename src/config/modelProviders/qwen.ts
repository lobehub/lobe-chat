import { ModelProviderCard } from '@/types/llm';

// ref: https://help.aliyun.com/zh/model-studio/getting-started/models
const Qwen: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 1_000_000,
      description: '通义千问超大规模语言模型，支持中文、英文等不同语言输入。',
      displayName: 'Qwen Turbo',
      enabled: true,
      functionCall: true,
      id: 'qwen-turbo-latest',
      pricing: {
        currency: 'CNY',
        input: 0.3,
        output: 0.6,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问超大规模语言模型增强版，支持中文、英文等不同语言输入。',
      displayName: 'Qwen Plus',
      enabled: true,
      functionCall: true,
      id: 'qwen-plus-latest',
      pricing: {
        currency: 'CNY',
        input: 0.8,
        output: 2,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        '通义千问千亿级别超大规模语言模型，支持中文、英文等不同语言输入，当前通义千问2.5产品版本背后的API模型。',
      displayName: 'Qwen Max',
      enabled: true,
      functionCall: true,
      id: 'qwen-max-latest',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 60,
      },
    },
    {
      contextWindowTokens: 1_000_000,
      description:
        '通义千问超大规模语言模型，支持长文本上下文，以及基于长文档、多文档等多个场景的对话功能。',
      displayName: 'Qwen Long',
      id: 'qwen-long',
      pricing: {
        currency: 'CNY',
        input: 0.5,
        output: 2,
      },
    },
    {
      contextWindowTokens: 32_000,
      description:
        '通义千问大规模视觉语言模型增强版。大幅提升细节识别能力和文字识别能力，支持超百万像素分辨率和任意长宽比规格的图像。',
      displayName: 'Qwen VL Plus',
      enabled: true,
      id: 'qwen-vl-plus-latest',
      pricing: {
        currency: 'CNY',
        input: 1.5,
        output: 4.5,
      },
      vision: true,
    },
    {
      contextWindowTokens: 32_768,
      description:
        '通义千问超大规模视觉语言模型。相比增强版，再次提升视觉推理能力和指令遵循能力，提供更高的视觉感知和认知水平。',
      displayName: 'Qwen VL Max',
      enabled: true,
      id: 'qwen-vl-max-latest',
      pricing: {
        currency: 'CNY',
        input: 3,
        output: 9,
      },
      vision: true,
    },
    {
      contextWindowTokens: 34_096,
      description:
        '通义千问OCR是文字提取专有模型，专注于文档、表格、试题、手写体文字等类型图像的文字提取能力。它能够识别多种文字，目前支持的语言有：汉语、英语、法语、日语、韩语、德语、俄语、意大利语、越南语、阿拉伯语。',
      displayName: 'Qwen VL OCR',
      id: 'qwen-vl-ocr-latest',
      pricing: {
        currency: 'CNY',
        input: 5,
        output: 5,
      },
      vision: true,
    },
    {
      contextWindowTokens: 4096,
      description: '通义千问数学模型是专门用于数学解题的语言模型。',
      displayName: 'Qwen Math Turbo',
      id: 'qwen-math-turbo-latest',
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 6,
      },
    },
    {
      contextWindowTokens: 4096,
      description: '通义千问数学模型是专门用于数学解题的语言模型。',
      displayName: 'Qwen Math Plus',
      id: 'qwen-math-plus-latest',
      pricing: {
        currency: 'CNY',
        input: 4,
        output: 12,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问代码模型。',
      displayName: 'Qwen Coder Turbo',
      id: 'qwen-coder-turbo-latest',
      pricing: {
        currency: 'CNY',
        input: 2,
        output: 6,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问代码模型。',
      displayName: 'Qwen Coder Plus',
      id: 'qwen-coder-plus-latest',
      pricing: {
        currency: 'CNY',
        input: 3.5,
        output: 7,
      },
    },
    {
      contextWindowTokens: 32_768,
      description: 'QwQ模型是由 Qwen 团队开发的实验性研究模型，专注于增强 AI 推理能力。',
      displayName: 'QwQ 32B Preview',
      id: 'qwq-32b-preview',
      pricing: {
        currency: 'CNY',
        input: 3.5,
        output: 7,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        'QVQ模型是由 Qwen 团队开发的实验性研究模型，专注于提升视觉推理能力，尤其在数学推理领域。',
      displayName: 'QVQ 72B Preview',
      id: 'qvq-72b-preview',
      pricing: {
        currency: 'CNY',
        input: 12,
        output: 36,
      },
      releasedAt: '2024-12-25',
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问2.5对外开源的7B规模的模型。',
      displayName: 'Qwen2.5 7B',
      functionCall: true,
      id: 'qwen2.5-7b-instruct',
      pricing: {
        currency: 'CNY',
        input: 0.5,
        output: 1,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问2.5对外开源的14B规模的模型。',
      displayName: 'Qwen2.5 14B',
      functionCall: true,
      id: 'qwen2.5-14b-instruct',
      pricing: {
        currency: 'CNY',
        input: 1,
        output: 3,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问2.5对外开源的32B规模的模型。',
      displayName: 'Qwen2.5 32B',
      functionCall: true,
      id: 'qwen2.5-32b-instruct',
      pricing: {
        currency: 'CNY',
        input: 3.5,
        output: 7,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问2.5对外开源的72B规模的模型。',
      displayName: 'Qwen2.5 72B',
      functionCall: true,
      id: 'qwen2.5-72b-instruct',
      pricing: {
        currency: 'CNY',
        input: 4,
        output: 12,
      },
    },
    {
      contextWindowTokens: 1_000_000,
      description: '通义千问2.5对外开源的72B规模的模型。',
      displayName: 'Qwen2.5 14B 1M',
      functionCall: true,
      id: 'qwen2.5-14b-instruct-1m',
      pricing: {
        currency: 'CNY',
        input: 1,
        output: 3,
      },
    },
    {
      contextWindowTokens: 4096,
      description: 'Qwen-Math 模型具有强大的数学解题能力。',
      displayName: 'Qwen2.5 Math 7B',
      id: 'qwen2.5-math-7b-instruct',
      pricing: {
        currency: 'CNY',
        input: 1,
        output: 2,
      },
    },
    {
      contextWindowTokens: 4096,
      description: 'Qwen-Math 模型具有强大的数学解题能力。',
      displayName: 'Qwen2.5 Math 72B',
      id: 'qwen2.5-math-72b-instruct',
      pricing: {
        currency: 'CNY',
        input: 4,
        output: 12,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问代码模型开源版。',
      displayName: 'Qwen2.5 Coder 7B',
      id: 'qwen2.5-coder-7b-instruct',
      pricing: {
        currency: 'CNY',
        input: 1,
        output: 2,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问代码模型开源版。',
      displayName: 'Qwen2.5 Coder 32B',
      id: 'qwen2.5-coder-32b-instruct',
      pricing: {
        currency: 'CNY',
        input: 3.5,
        output: 7,
      },
    },
    {
      contextWindowTokens: 8000,
      description: '以 Qwen-7B 语言模型初始化，添加图像模型，图像输入分辨率为448的预训练模型。',
      displayName: 'Qwen VL',
      id: 'qwen-vl-v1',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      vision: true,
    },
    {
      contextWindowTokens: 8000,
      description: '通义千问VL支持灵活的交互方式，包括多图、多轮问答、创作等能力的模型。',
      displayName: 'Qwen VL Chat',
      id: 'qwen-vl-chat-v1',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      vision: true,
    },
    {
      contextWindowTokens: 128_000,
      description:
        '指令跟随、数学、解题、代码整体提升，万物识别能力提升，支持多样格式直接精准定位视觉元素，支持对长视频文件（最长10分钟）进行理解和秒级别的事件时刻定位，能理解时间先后和快慢，基于解析和定位能力支持操控OS或Mobile的Agent，关键信息抽取能力和Json格式输出能力强，此版本为72B版本，本系列能力最强的版本。',
      displayName: 'Qwen2.5 VL 72B',
      id: 'qwen2.5-vl-72b-instruct',
      pricing: {
        currency: 'CNY',
        input: 16,
        output: 48,
      },
      releasedAt: '2025-01-26',
      vision: true,
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek-R1 在后训练阶段大规模使用了强化学习技术，在仅有极少标注数据的情况下，极大提升了模型推理能力。在数学、代码、自然语言推理等任务上，性能较高，能力较强。',
      displayName: 'DeepSeek R1',
      id: 'deepseek-r1',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2025-01-27',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek-V3 为自研 MoE 模型，671B 参数，激活 37B，在 14.8T token 上进行了预训练，在长文本、代码、数学、百科、中文能力上表现优秀。',
      displayName: 'DeepSeek V3',
      id: 'deepseek-v3',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2025-01-27',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek-R1-Distill-Qwen-1.5B 是一个基于 Qwen2.5-Math-1.5B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
      displayName: 'DeepSeek R1 Distill Qwen 1.5B',
      id: 'deepseek-r1-distill-qwen-1.5b',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2025-02-05',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek-R1-Distill-Qwen-7B 是一个基于 Qwen2.5-Math-7B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
      displayName: 'DeepSeek R1 Distill Qwen 7B',
      id: 'deepseek-r1-distill-qwen-7b',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2025-02-05',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek-R1-Distill-Qwen-14B 是一个基于 Qwen2.5-14B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
      displayName: 'DeepSeek R1 Distill Qwen 14B',
      id: 'deepseek-r1-distill-qwen-14b',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2025-02-05',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek-R1-Distill-Qwen-32B 是一个基于 Qwen2.5-32B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
      displayName: 'DeepSeek R1 Distill Qwen 32B',
      id: 'deepseek-r1-distill-qwen-32b',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2025-02-05',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek-R1-Distill-Llama-8B 是一个基于 Llama-3.1-8B 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
      displayName: 'DeepSeek R1 Distill Llama 8B',
      id: 'deepseek-r1-distill-llama-8b',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2025-02-05',
    },
    {
      contextWindowTokens: 131_072,
      description:
        'DeepSeek-R1-Distill-Llama-70B 是一个基于 Llama-3.3-70B-Instruct 的蒸馏大型语言模型，使用了 DeepSeek R1 的输出。',
      displayName: 'DeepSeek R1 Distill Llama 70B',
      id: 'deepseek-r1-distill-llama-70b',
      pricing: {
        currency: 'CNY',
        input: 0,
        output: 0,
      },
      releasedAt: '2025-02-05',
    },
  ],
  checkModel: 'qwen-turbo-latest',
  description:
    '通义千问是阿里云自主研发的超大规模语言模型，具有强大的自然语言理解和生成能力。它可以回答各种问题、创作文字内容、表达观点看法、撰写代码等，在多个领域发挥作用。',
  disableBrowserRequest: true,
  id: 'qwen',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details',
  name: 'Aliyun Bailian',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    },
    responseAnimation: {
      speed: 2,
      text: 'smooth',
    },
    sdkType: 'openai',
    showDeployName: true,
    showModelFetcher: true,
  },
  url: 'https://www.aliyun.com/product/bailian',
};

export default Qwen;
