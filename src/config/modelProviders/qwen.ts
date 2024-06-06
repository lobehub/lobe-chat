import { ModelProviderCard } from '@/types/llm';

// ref https://help.aliyun.com/zh/dashscope/developer-reference/api-details
const Qwen: ModelProviderCard = {
  chatModels: [
    {
      description: '通义千问超大规模语言模型，支持中文、英文等不同语言输入。',
      displayName: 'Qwen Turbo',
      enabled: true,
      id: 'qwen-turbo',
      tokens: 8192,
    },
    {
      description: '通义千问超大规模语言模型增强版，支持中文、英文等不同语言输入。',
      displayName: 'Qwen Plus',
      enabled: true,
      id: 'qwen-plus',
      tokens: 30_720,
    },
    {
      description:
        '通义千问千亿级别超大规模语言模型，支持中文、英文等不同语言输入，当前通义千问2.5产品版本背后的API模型。',
      displayName: 'Qwen Max',
      enabled: true,
      id: 'qwen-max',
      tokens: 8192,
    },
  ],
  checkModel: 'qwen-turbo',
  id: 'qwen',
  modelList: { showModelFetcher: true },
  name: 'Qwen',
};

export default Qwen;
