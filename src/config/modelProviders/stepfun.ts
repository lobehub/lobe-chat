import { ModelProviderCard } from '@/types/llm';

// ref https://platform.stepfun.com/docs/llm/text
// 根据文档，阶级星辰大模型的上下文长度，其 k 的含义均为 1000
const Stepfun: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Step 2 16K',
      enabled: true,
      id: 'step-2-16k',
      tokens: 16_000,
    },
    {
      displayName: 'Step 1 256K',
      id: 'step-1-256k',
      tokens: 256_000,
    },
    {
      displayName: 'Step 1 128K',
      enabled: true,
      id: 'step-1-128k',
      tokens: 128_000,
    },
    {
      displayName: 'Step 1 32K',
      enabled: true,
      id: 'step-1-32k',
      tokens: 32_000,
    },
    {
      displayName: 'Step 1 8K',
      enabled: true,
      id: 'step-1-8k',
      tokens: 8000,
    },
    {
      displayName: 'Step 1 Flash',
      enabled: true,
      id: 'step-1-flash',
      tokens: 8000,
    },
    {
      displayName: 'Step 1V 32K',
      enabled: true,
      id: 'step-1v-32k',
      tokens: 32_000,
      vision: true,
    },
    {
      displayName: 'Step 1V 8K',
      enabled: true,
      id: 'step-1v-8k',
      tokens: 8000,
      vision: true,
    },
  ],
  checkModel: 'step-1-flash',
  // after test, currently https://api.stepfun.com/v1/chat/completions has the CORS issue
  // So we should close the browser request mode
  disableBrowserRequest: true,
  id: 'stepfun',
  modelList: { showModelFetcher: true },
  name: 'Stepfun',
  smoothing: {
    speed: 2,
    text: true,
  },
};

export default Stepfun;
