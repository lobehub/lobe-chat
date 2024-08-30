import { ModelProviderCard } from '@/types/llm';

// ref https://platform.stepfun.com/docs/llm/text
const Stepfun: ModelProviderCard = {
  chatModels: [
    {
      id: 'step-2-16k-nightly',
      tokens: 16_384,
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
      tokens: 32_768,
    },
    {
      enabled: true,
      id: 'step-1-8k',
      tokens: 8192,
    },
    {
      enabled: true,
      id: 'step-1v-32k',
      tokens: 32_768,
      vision: true,
    },
    {
      enabled: true,
      id: 'step-1v-8k',
      tokens: 8192,
      vision: true,
    },
  ],
  checkModel: 'step-1-8k',
  // after test, currently https://api.stepfun.com/v1/chat/completions has the CORS issue
  // So we should close the browser request mode
  disableBrowserRequest: true,
  id: 'stepfun',
  modelList: { showModelFetcher: true },
  name: '阶跃星辰',
};

export default Stepfun;
