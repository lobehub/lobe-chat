import { ModelProviderCard } from '@/types/llm';

const InternLM: ModelProviderCard = {
  chatModels: [],
  checkModel: 'internlm2.5-latest',
  description:
    '致力于大模型研究与开发工具链的开源组织。为所有 AI 开发者提供高效、易用的开源平台，让最前沿的大模型与算法技术触手可及',
  disableBrowserRequest: true,
  id: 'internlm',
  modelList: { showModelFetcher: true },
  modelsUrl:
    'https://internlm.intern-ai.org.cn/doc/docs/Models#%E8%8E%B7%E5%8F%96%E6%A8%A1%E5%9E%8B%E5%88%97%E8%A1%A8',
  name: 'InternLM',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://internlm-chat.intern-ai.org.cn/puyu/api/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://internlm.intern-ai.org.cn',
};

export default InternLM;
