import { ModelProviderCard } from '@/types/llm';

// ref https://help.aliyun.com/zh/dashscope/developer-reference/api-details
const Qwen: ModelProviderCard = {
  chatModels: [
    {
      description: '通义千问超大规模语言模型，支持中文、英文等不同语言输入',
      displayName: 'Qwen Turbo',
      enabled: true,
      functionCall: true,
      id: 'qwen-turbo',
      tokens: 8000,
    },
    {
      description: '通义千问超大规模语言模型增强版，支持中文、英文等不同语言输入',
      displayName: 'Qwen Plus',
      enabled: true,
      functionCall: true,
      id: 'qwen-plus',
      tokens: 32_000,
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
      description: '通义千问2对外开源的7B规模的模型',
      displayName: 'Qwen2 7B',
      id: 'qwen2-7b-instruct',
      tokens: 131_072,
    },
    {
      description: '通义千问2对外开源的57B规模14B激活参数的MOE模型',
      displayName: 'Qwen2 57B-A14B MoE',
      id: 'qwen2-57b-a14b-instruct',
      tokens: 32_768,
    },
    {
      description: '通义千问2对外开源的72B规模的模型',
      displayName: 'Qwen2 72B',
      id: 'qwen2-72b-instruct',
      tokens: 131_072,
    },
    {
      description:
        '通义千问大规模视觉语言模型增强版。大幅提升细节识别能力和文字识别能力，支持超百万像素分辨率和任意长宽比规格的图像。',
      displayName: 'Qwen VL Plus',
      enabled: true,
      id: 'qwen-vl-plus',
      tokens: 6144,
      vision: true,
    },
    {
      description:
        '通义千问超大规模视觉语言模型。相比增强版，再次提升视觉推理能力和指令遵循能力，提供更高的视觉感知和认知水平。',
      displayName: 'Qwen VL Max',
      enabled: true,
      id: 'qwen-vl-max',
      tokens: 6144,
      vision: true,
    },
  ],
  checkModel: 'qwen-turbo',
  disableBrowserRequest: true,
  id: 'qwen',
  modelList: { showModelFetcher: true },
  name: 'Qwen',
};

export default Qwen;
