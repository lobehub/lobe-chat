import { ModelProviderCard } from '@/types/llm';

// ref https://help.aliyun.com/zh/dashscope/developer-reference/api-details
const Qwen: ModelProviderCard = {
  chatModels: [
    {
      description: '通义千问超大规模语言模型，支持长文本上下文，以及基于长文档、多文档等多个场景的对话功能。',
      displayName: 'Qwen Long',
      enabled: true,
      id: 'qwen-long',
      tokens: 1_000_000,
    },
    {
      description: '通义千问超大规模语言模型，支持中文、英文等不同语言输入',
      displayName: 'Qwen Turbo',
      enabled: true,
      functionCall: true,
      id: 'qwen-turbo',
      tokens: 8000, // https://www.alibabacloud.com/help/zh/model-studio/developer-reference/use-qwen-by-calling-api
    },
    {
      description: '通义千问超大规模语言模型增强版，支持中文、英文等不同语言输入',
      displayName: 'Qwen Plus',
      enabled: true,
      functionCall: true,
      id: 'qwen-plus',
      tokens: 131_072, // https://help.aliyun.com/zh/dashscope/developer-reference/model-introduction
    },
    {
      description:
        '通义千问千亿级别超大规模语言模型，支持中文、英文等不同语言输入，当前通义千问2.5产品版本背后的API模型',
      displayName: 'Qwen Max',
      enabled: true,
      functionCall: true,
      id: 'qwen-max',
      tokens: 8000,
    },
    {
      description:
        '通义千问千亿级别超大规模语言模型，支持中文、英文等不同语言输入，扩展了上下文窗口',
      displayName: 'Qwen Max LongContext',
      functionCall: true,
      id: 'qwen-max-longcontext',
      tokens: 30_000,
    },
    {
      description:
        '通义千问大规模视觉语言模型增强版。大幅提升细节识别能力和文字识别能力，支持超百万像素分辨率和任意长宽比规格的图像。',
      displayName: 'Qwen VL Plus',
      enabled: true,
      id: 'qwen-vl-plus',
      tokens: 8192,
      vision: true,
    },
    {
      description:
        '通义千问超大规模视觉语言模型。相比增强版，再次提升视觉推理能力和指令遵循能力，提供更高的视觉感知和认知水平。',
      displayName: 'Qwen VL Max',
      enabled: true,
      id: 'qwen-vl-max',
      tokens: 8192,
      vision: true,
    },
    {
      description:
        '抢先体验即将升级的 qwen-vl-max 大模型。',
      displayName: 'Qwen VL Max 0809',
      enabled: true,
      id: 'qwen-vl-max-0809',
      tokens: 32_768,
      vision: true,
    },
    // ref https://help.aliyun.com/zh/dashscope/developer-reference/tongyi-qianwen-7b-14b-72b-api-detailes
    {
      description: '通义千问2对外开源的7B规模的模型',
      displayName: 'Qwen2 7B',
      id: 'qwen2-7b-instruct',
      tokens: 131_072, // https://huggingface.co/Qwen/Qwen2-7B-Instruct
    },
    {
      description: '通义千问2对外开源的57B规模14B激活参数的MOE模型',
      displayName: 'Qwen2 57B-A14B MoE',
      id: 'qwen2-57b-a14b-instruct',
      tokens: 65_536, // https://huggingface.co/Qwen/Qwen2-57B-A14B-Instruct
    },
    {
      description: '通义千问2对外开源的72B规模的模型',
      displayName: 'Qwen2 72B',
      id: 'qwen2-72b-instruct',
      tokens: 131_072, // https://huggingface.co/Qwen/Qwen2-72B-Instruct
    },
    {
      description: 'Qwen2-Math 模型具有强大的数学解题能力',
      displayName: 'Qwen2 Math 72B',
      id: 'qwen2-math-72b-instruct',
      tokens: 4096, // https://help.aliyun.com/zh/dashscope/developer-reference/use-qwen2-math-by-calling-api
    },
    {
      description:
        '以 Qwen-7B 语言模型初始化，添加图像模型，图像输入分辨率为448的预训练模型。',
      displayName: 'Qwen VL',
      id: 'qwen-vl-v1',
      tokens: 8192, // https://huggingface.co/Qwen/Qwen-VL/blob/main/config.json
      vision: true,
    },
    {
      description:
        '通义千问VL支持灵活的交互方式，包括多图、多轮问答、创作等能力的模型。',
      displayName: 'Qwen VL Chat',
      id: 'qwen-vl-chat-v1',
      tokens: 8192, // https://huggingface.co/Qwen/Qwen-VL-Chat/blob/main/config.json
      vision: true,
    },
  ],
  checkModel: 'qwen-turbo',
  disableBrowserRequest: true, // CORS issue
  id: 'qwen',
  modelList: { showModelFetcher: true },
  name: 'Qwen',
};

export default Qwen;
