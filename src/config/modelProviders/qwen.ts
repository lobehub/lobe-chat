import { ModelProviderCard } from '@/types/llm';

// ref :https://help.aliyun.com/zh/dashscope/developer-reference/api-details
const Qwen: ModelProviderCard = {
  chatModels: [
    {
      description:
        '通义千问超大规模语言模型，支持长文本上下文，以及基于长文档、多文档等多个场景的对话功能。',
      displayName: 'Qwen Long',
      id: 'qwen-long',
      pricing: {
        currency: 'CNY',
        input: 0.5,
        output: 2,
      },
      tokens: 1_000_000, // https://help.aliyun.com/zh/dashscope/developer-reference/model-introduction
    },
    {
      description: '通义千问超大规模语言模型，支持中文、英文等不同语言输入',
      displayName: 'Qwen Turbo',
      enabled: true,
      functionCall: true,
      id: 'qwen-turbo-latest',
      pricing: {
        currency: 'CNY',
        input: 0.3,
        output: 0.6,
      },
      tokens: 131_072, // https://help.aliyun.com/zh/dashscope/developer-reference/model-introduction
    },
    {
      description: '通义千问超大规模语言模型增强版，支持中文、英文等不同语言输入',
      displayName: 'Qwen Plus',
      enabled: true,
      functionCall: true,
      id: 'qwen-plus-latest',
      pricing: {
        currency: 'CNY',
        input: 0.8,
        output: 2,
      },
      tokens: 131_072, // https://help.aliyun.com/zh/dashscope/developer-reference/model-introduction
    },
    {
      description:
        '通义千问千亿级别超大规模语言模型，支持中文、英文等不同语言输入，当前通义千问2.5产品版本背后的API模型',
      displayName: 'Qwen Max',
      enabled: true,
      functionCall: true,
      id: 'qwen-max-latest',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 60,
      },
      tokens: 32_768, // https://help.aliyun.com/zh/dashscope/developer-reference/model-introduction
    },
    {
      description:
        '通义千问大规模视觉语言模型增强版。大幅提升细节识别能力和文字识别能力，支持超百万像素分辨率和任意长宽比规格的图像。',
      displayName: 'Qwen VL Plus',
      enabled: true,
      id: 'qwen-vl-plus',
      pricing: {
        currency: 'CNY',
        input: 8,
        output: 8,
      },
      tokens: 8192,
      vision: true, // https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-vl-plus-api
    },
    {
      description:
        '通义千问超大规模视觉语言模型。相比增强版，再次提升视觉推理能力和指令遵循能力，提供更高的视觉感知和认知水平。',
      displayName: 'Qwen VL Max',
      enabled: true,
      id: 'qwen-vl-max',
      pricing: {
        currency: 'CNY',
        input: 20,
        output: 20,
      },
      tokens: 32_768,
      vision: true, // https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-vl-plus-api
    },
    // ref :https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-7b-14b-72b-api-detailes
    {
      description: '通义千问2.5对外开源的7B规模的模型',
      displayName: 'Qwen2.5 7B',
      functionCall: true,
      id: 'qwen2.5-7b-instruct',
      tokens: 131_072, // https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
    },
    {
      description: '通义千问2.5对外开源的32B规模的模型',
      displayName: 'Qwen2.5 32B',
      functionCall: true,
      id: 'qwen2.5-32b-instruct',
      tokens: 131_072, // https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
    },
    {
      description: '通义千问2.5对外开源的72B规模的模型',
      displayName: 'Qwen2.5 72B',
      functionCall: true,
      id: 'qwen2.5-72b-instruct',
      tokens: 131_072, // https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
    },
    {
      description: '通义千问2对外开源的7B规模的模型',
      displayName: 'Qwen2 7B',
      functionCall: true,
      id: 'qwen2-7b-instruct',
      tokens: 131_072, // https://huggingface.co/Qwen/Qwen2-7B-Instruct
    },
    {
      description: '通义千问2对外开源的57B规模14B激活参数的MOE模型',
      displayName: 'Qwen2 57B A14B MoE',
      functionCall: true,
      id: 'qwen2-57b-a14b-instruct',
      tokens: 65_536, // https://huggingface.co/Qwen/Qwen2-57B-A14B-Instruct
    },
    {
      description: '通义千问2对外开源的72B规模的模型',
      displayName: 'Qwen2 72B',
      functionCall: true,
      id: 'qwen2-72b-instruct',
      tokens: 131_072, // https://huggingface.co/Qwen/Qwen2-72B-Instruct
    },
    {
      description: 'Qwen2-Math 模型具有强大的数学解题能力',
      displayName: 'Qwen2 Math 72B',
      functionCall: true,
      id: 'qwen2-math-72b-instruct',
      tokens: 4096, // https://help.aliyun.com/zh/dashscope/developer-reference/use-qwen2-math-by-calling-api
    },
    {
      description: '以 Qwen-7B 语言模型初始化，添加图像模型，图像输入分辨率为448的预训练模型。',
      displayName: 'Qwen VL',
      id: 'qwen-vl-v1',
      tokens: 8192, // https://huggingface.co/Qwen/Qwen-VL/blob/main/config.json
      vision: true,
    },
    {
      description: '通义千问VL支持灵活的交互方式，包括多图、多轮问答、创作等能力的模型。',
      displayName: 'Qwen VL Chat',
      id: 'qwen-vl-chat-v1',
      tokens: 8192, // https://huggingface.co/Qwen/Qwen-VL-Chat/blob/main/config.json
      vision: true,
    },
  ],
  checkModel: 'qwen-turbo',
  description:
    '通义千问是阿里云自主研发的超大规模语言模型，具有强大的自然语言理解和生成能力。它可以回答各种问题、创作文字内容、表达观点看法、撰写代码等，在多个领域发挥作用。',
  disableBrowserRequest: true,
  id: 'qwen',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://help.aliyun.com/zh/dashscope/developer-reference/api-details',
  name: 'Qwen',
  smoothing: {
    speed: 2,
    text: true,
  },
  url: 'https://tongyi.aliyun.com',
};

export default Qwen;
