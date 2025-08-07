import { AIChatModelCard } from '@/types/aiModel';

const baichuanChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: true,
      search: true,
    },
    contextWindowTokens: 32_768,
    description:
      '模型能力国内第一，在知识百科、长文本、生成创作等中文任务上超越国外主流模型。还具备行业领先的多模态能力，多项权威评测基准表现优异。',
    displayName: 'Baichuan 4',
    enabled: true,
    id: 'Baichuan4',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 100, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 100, strategy: 'fixed', unit: 'millionTokens' },
      ],
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
      '模型能力国内第一，在知识百科、长文本、生成创作等中文任务上超越国外主流模型。还具备行业领先的多模态能力，多项权威评测基准表现优异。',
    displayName: 'Baichuan 4 Turbo',
    enabled: true,
    id: 'Baichuan4-Turbo',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 15, strategy: 'fixed', unit: 'millionTokens' },
      ],
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
      '模型能力国内第一，在知识百科、长文本、生成创作等中文任务上超越国外主流模型。还具备行业领先的多模态能力，多项权威评测基准表现优异。',
    displayName: 'Baichuan 4 Air',
    enabled: true,
    id: 'Baichuan4-Air',
    maxOutput: 4096,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 0.98, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 0.98, strategy: 'fixed', unit: 'millionTokens' },
      ],
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
      '针对企业高频场景优化，效果大幅提升，高性价比。相对于Baichuan2模型，内容创作提升20%，知识问答提升17%， 角色扮演能力提升40%。整体效果比GPT3.5更优。',
    displayName: 'Baichuan 3 Turbo',
    id: 'Baichuan3-Turbo',
    maxOutput: 8192,
    pricing: {
      currency: 'CNY',
      units: [
        { name: 'textInput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 12, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    settings: {
      searchImpl: 'params',
    },
    type: 'chat',
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
      units: [
        { name: 'textInput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 24, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
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
      units: [
        { name: 'textInput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
        { name: 'textOutput', rate: 8, strategy: 'fixed', unit: 'millionTokens' },
      ],
    },
    type: 'chat',
  },
];

export const allModels = [...baichuanChatModels];

export default allModels;
