import { ModelProviderCard } from '@/types/llm';

// ref https://platform.baichuan-ai.com/price
const Baichuan: ModelProviderCard = {
  chatModels: [
    {
      description: '模型能力国内第一，在知识百科、长文本、生成创作等中文任务上超越国外主流模型。还具备行业领先的多模态能力，多项权威评测基准表现优异。',
      displayName: 'Baichuan 4',
      enabled: true,
      functionCall: true,
      id: 'Baichuan4',
      maxOutput: 4096,
      tokens: 32_768,
    },
    {
      description: '针对企业高频场景优化，效果大幅提升，高性价比。相对于Baichuan2模型，内容创作提升20%，知识问答提升17%， 角色扮演能力提升40%。整体效果比GPT3.5更优。',
      displayName: 'Baichuan 3 Turbo',
      enabled: true,
      functionCall: true,
      id: 'Baichuan3-Turbo',
      maxOutput: 8192,
      tokens: 32_768,
    },
    {
      description: '具备 128K 超长上下文窗口，针对企业高频场景优化，效果大幅提升，高性价比。相对于Baichuan2模型，内容创作提升20%，知识问答提升17%， 角色扮演能力提升40%。整体效果比GPT3.5更优。',
      displayName: 'Baichuan 3 Turbo 128k',
      enabled: true,
      id: 'Baichuan3-Turbo-128k',
      maxOutput: 4096,
      tokens: 128_000,
    },
    {
      description: '采用搜索增强技术实现大模型与领域知识、全网知识的全面链接。支持PDF、Word等多种文档上传及网址输入，信息获取及时、全面，输出结果准确、专业。',
      displayName: 'Baichuan 2 Turbo',
      id: 'Baichuan2-Turbo',
      maxOutput: 8192,
      tokens: 32_768,
    },
    {
      description: '具备 192K 超长上下文窗口，采用搜索增强技术实现大模型与领域知识、全网知识的全面链接。支持PDF、Word等多种文档上传及网址输入，信息获取及时、全面，输出结果准确、专业。',
      displayName: 'Baichuan 2 Turbo 192k',
      id: 'Baichuan2-Turbo-192k',
      maxOutput: 2048,
      tokens: 192_000,
    },
  ],
  checkModel: 'Baichuan3-Turbo',
  id: 'baichuan',
  modelList: { showModelFetcher: true },
  name: 'Baichuan',
  smoothing: {
    speed: 2,
    text: true,
  },
};

export default Baichuan;
