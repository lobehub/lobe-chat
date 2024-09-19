import { ModelProviderCard } from '@/types/llm';

// ref https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Nlks5zkzu
const BaiduWenxin: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'ERNIE-4.0-8K',
      enabled: true,
      id: 'ERNIE-4.0-8K',
      tokens: 8192,
    },
    {
      id: 'ERNIE-4.0-8K-Preview',
      tokens: 8192,
    },
    {
      id: 'ERNIE-4.0-8K-Preview-0518',
      tokens: 8192,
    },
    {
      enabled: true,
      id: 'ERNIE-4.0-8K-Latest',
      tokens: 8192,
    },
    {
      displayName: 'ERNIE-4.0-8K-0329',
      id: 'ernie-4.0-8k-0329',
      tokens: 8192,
    },
    {
      displayName: 'ERNIE-4.0-8K-0104',
      id: 'ernie-4.0-8k-0104',
      tokens: 8192,
    },
    {
      displayName: 'ERNIE-4.0-8K-0613',
      id: 'ernie-4.0-8k-0613',
      tokens: 8192,
    },
    {
      enabled: true,
      id: 'ERNIE-4.0-Turbo-8K',
      tokens: 8192,
    },
    {
      id: 'ERNIE-4.0-Turbo-8K-Preview',
      tokens: 8192,
    },
    {
      id: 'ERNIE-3.5-8K',
      tokens: 8192,
    },
    {
      id: 'ERNIE-3.5-8K-0205',
      tokens: 8192,
    },
    {
      id: 'ERNIE-3.5-8K-Preview',
      tokens: 8192,
    },
    {
      id: 'ERNIE-3.5-8K-0329',
      tokens: 8192,
    },
    {
      enabled: true,
      id: 'ERNIE-3.5-128K',
      tokens: 128_000,
    },
    {
      id: 'ERNIE-3.5-8K-0613',
      tokens: 8192,
    },
  ],
  checkModel: 'ERNIE-4.0-8K',
  disableBrowserRequest: true,
  id: 'wenxin',
  name: 'Wenxin',
};

export default BaiduWenxin;
