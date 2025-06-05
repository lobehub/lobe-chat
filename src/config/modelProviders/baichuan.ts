import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.baichuan-ai.com/price
const Baichuan: ModelProviderCard = {
  chatModels: [
    {
      contextWindowTokens: 32_768,
      description:
        '模型能力国内第一，在知识百科、长文本、生成创作等中文任务上超越国外主流模型。还具备行业领先的多模态能力，多项权威评测基准表现优异。',
      displayName: 'Baichuan 4',
      enabled: true,
      functionCall: true,
      id: 'Baichuan4',
      maxOutput: 4096,
      pricing: {
        currency: 'CNY',
        input: 100,
        output: 100,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        '模型能力国内第一，在知识百科、长文本、生成创作等中文任务上超越国外主流模型。还具备行业领先的多模态能力，多项权威评测基准表现优异。',
      displayName: 'Baichuan 4 Turbo',
      enabled: true,
      functionCall: true,
      id: 'Baichuan4-Turbo',
      maxOutput: 4096,
      pricing: {
        currency: 'CNY',
        input: 15,
        output: 15,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        '模型能力国内第一，在知识百科、长文本、生成创作等中文任务上超越国外主流模型。还具备行业领先的多模态能力，多项权威评测基准表现优异。',
      displayName: 'Baichuan 4 Air',
      enabled: true,
      functionCall: true,
      id: 'Baichuan4-Air',
      maxOutput: 4096,
      pricing: {
        currency: 'CNY',
        input: 0.98,
        output: 0.98,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        '针对企业高频场景优化，效果大幅提升，高性价比。相对于Baichuan2模型，内容创作提升20%，知识问答提升17%， 角色扮演能力提升40%。整体效果比GPT3.5更优。',
      displayName: 'Baichuan 3 Turbo',
      functionCall: true,
      id: 'Baichuan3-Turbo',
      maxOutput: 8192,
      pricing: {
        currency: 'CNY',
        input: 12,
        output: 12,
      },
    },
    {
      contextWindowTokens: 128_000,
      description:
        '具备 128K 超长上下文窗口，针对企业高频场景优化，效果大幅提升，高性价比。相对于Baichuan2模型，内容创作提升20%，知识问答提升17%， 角色扮演能力提升40%。整体效果比GPT3.5更优。',
      displayName: 'Baichuan 3 Turbo 128k',
      id: 'Baichuan3-Turbo-128k',
      maxOutput: 4096,
      pricing: {
        currency: 'CNY',
        input: 24,
        output: 24,
      },
    },
    {
      contextWindowTokens: 32_768,
      description:
        '采用搜索增强技术实现大模型与领域知识、全网知识的全面链接。支持PDF、Word等多种文档上传及网址输入，信息获取及时、全面，输出结果准确、专业。',
      displayName: 'Baichuan 2 Turbo',
      id: 'Baichuan2-Turbo',
      maxOutput: 8192,
      pricing: {
        currency: 'CNY',
        input: 8,
        output: 8,
      },
    },
  ],
  checkModel: 'Baichuan3-Turbo',
  description:
    '百川智能是一家专注于人工智能大模型研发的公司，其模型在国内知识百科、长文本处理和生成创作等中文任务上表现卓越，超越了国外主流模型。百川智能还具备行业领先的多模态能力，在多项权威评测中表现优异。其模型包括 Baichuan 4、Baichuan 3 Turbo 和 Baichuan 3 Turbo 128k 等，分别针对不同应用场景进行优化，提供高性价比的解决方案。',
  id: 'baichuan',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.baichuan-ai.com/price',
  name: 'Baichuan',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.baichuan-ai.com/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
    smoothing: {
      speed: 2,
      text: true,
    },
  },
  smoothing: {
    speed: 2,
    text: true,
  },
  url: 'https://platform.baichuan-ai.com',
};

export default Baichuan;
