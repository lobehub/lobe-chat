import { ModelProviderCard } from '@/types/llm';

// ref: https://platform.stepfun.com/docs/llm/text
// 根据文档，阶级星辰大模型的上下文长度，其 k 的含义均为 1000
const Stepfun: ModelProviderCard = {
  chatModels: [
    {
      description: '支持大规模上下文交互，适合复杂对话场景。',
      displayName: 'Step 2 16K',
      enabled: true,
      functionCall: true,
      id: 'step-2-16k',
      tokens: 16_000,
    },
    {
      description: '具备超长上下文处理能力，尤其适合长文档分析。',
      displayName: 'Step 1 256K',
      functionCall: true,
      id: 'step-1-256k',
      tokens: 256_000,
    },
    {
      description: '平衡性能与成本，适合一般场景。',
      displayName: 'Step 1 128K',
      enabled: true,
      functionCall: true,
      id: 'step-1-128k',
      tokens: 128_000,
    },
    {
      description: '支持中等长度的对话，适用于多种应用场景。',
      displayName: 'Step 1 32K',
      enabled: true,
      functionCall: true,
      id: 'step-1-32k',
      tokens: 32_000,
    },
    {
      description: '小型模型，适合轻量级任务。',
      displayName: 'Step 1 8K',
      enabled: true,
      functionCall: true,
      id: 'step-1-8k',
      tokens: 8000,
    },
    {
      description: '高速模型，适合实时对话。',
      displayName: 'Step 1 Flash',
      enabled: true,
      functionCall: true,
      id: 'step-1-flash',
      tokens: 8000,
    },
    {
      description: '支持视觉输入，增强多模态交互体验。',
      displayName: 'Step 1V 32K',
      enabled: true,
      functionCall: true,
      id: 'step-1v-32k',
      tokens: 32_000,
      vision: true,
    },
    {
      description: '小型视觉模型，适合基本的图文任务。',
      displayName: 'Step 1V 8K',
      enabled: true,
      functionCall: true,
      id: 'step-1v-8k',
      tokens: 8000,
      vision: true,
    },
  ],
  checkModel: 'step-1-flash',
  description:
    '阶级星辰大模型具备行业领先的多模态及复杂推理能力，支持超长文本理解和强大的自主调度搜索引擎功能。',
  // after test, currently https://api.stepfun.com/v1/chat/completions has the CORS issue
  // So we should close the browser request mode
  disableBrowserRequest: true,
  id: 'stepfun',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://platform.stepfun.com/docs/llm/text',
  name: 'Stepfun',
  smoothing: {
    speed: 2,
    text: true,
  },
  url: 'https://stepfun.com',
};

export default Stepfun;
