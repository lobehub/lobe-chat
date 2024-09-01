import { ModelProviderCard } from '@/types/llm';

// ref https://platform.stepfun.com/docs/llm/text
// 根据文档，阶级星辰大模型的上下文长度，其 k 的含义为 1000
const Stepfun: ModelProviderCard = {
  chatModels: [
    {
      id: 'step-2-16k-nightly',
      tokens: 16_000,
    },
    {
      id: 'step-1-256k',
      tokens: 256_000,
    },
    {
      enabled: true,
      id: 'step-1-128k',
      tokens: 128_000,
    },
    {
      enabled: true,
      id: 'step-1-32k',
      tokens: 32_000,
    },
    {
      enabled: true,
      id: 'step-1-8k',
      tokens: 8000,
    },
    {
      enabled: true,
      id: 'step-1-flash',
      tokens: 8000,
    },
    {
      enabled: true,
      id: 'step-1v-32k',
      tokens: 32_000,
      vision: true,
    },
    {
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
  name: '阶跃星辰',
};

export default Stepfun;
