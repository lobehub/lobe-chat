import { ModelProviderCard } from '@/types/llm';

const PPIO: ModelProviderCard = {
  chatModels: [],
  checkModel: 'deepseek/deepseek-r1-distill-qwen-32b',
  description:
    'PPIO 派欧云提供稳定、高性价比的开源模型 API 服务，支持 DeepSeek 全系列、Llama、Qwen 等行业领先大模型。',
  disableBrowserRequest: true,
  id: 'ppio',
  modelList: { showModelFetcher: true },
  modelsUrl:
    'https://ppinfra.com/llm-api?utm_source=github_lobe-chat&utm_medium=github_readme&utm_campaign=link',
  name: 'PPIO',
  settings: {
    disableBrowserRequest: true,
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://ppinfra.com/user/register?invited_by=RQIMOC&utm_source=github_lobechat',
};

export default PPIO;
