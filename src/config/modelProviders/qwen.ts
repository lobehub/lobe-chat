import { ModelProviderCard } from '@/types/llm';

// ref: https://help.aliyun.com/zh/model-studio/getting-started/models
const Qwen: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 131_072,
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
        input: 8,
        output: 8,
      },
      vision: true,
    },
    {
      contextWindowTokens: 32_000,
      description:
        '通义千问超大规模视觉语言模型。相比增强版，再次提升视觉推理能力和指令遵循能力，提供更高的视觉感知和认知水平。',
      displayName: 'Qwen VL Max',
      enabled: true,
      id: 'qwen-vl-max-latest',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 20,
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
        input: 0,
        output: 0,
      },
    },
    {
      contextWindowTokens: 131_072,
      description: '通义千问2.5对外开源的7B规模的模型。',
      displayName: 'Qwen2.5 7B',
      functionCall: true,
      id: 'qwen2.5-7b-instruct',
      pricing: {
        currency: 'CNY',
        input: 1,
        output: 2,
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
        input: 2,
        output: 6,
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
  ],
  checkModel: 'qwen-turbo-latest',
  description:
    '通义千问是阿里云自主研发的超大规模语言模型，具有强大的自然语言理解和生成能力。它可以回答各种问题、创作文字内容、表达观点看法、撰写代码等，在多个领域发挥作用。',
  disableBrowserRequest: true,
  id: 'qwen',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details',
  name: 'Qwen',
  proxyUrl: {
    placeholder: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  smoothing: {
    speed: 2,
    text: true,
  },
  url: 'https://www.aliyun.com/product/bailian',
};

export default Qwen;
