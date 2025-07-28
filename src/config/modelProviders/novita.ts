import { ModelProviderCard } from '@/types/llm';

// ref: https://novita.ai/model-api/product/llm-api
const Novita: ModelProviderCard = {
  chatModels: [],
  checkModel: 'meta-llama/llama-3.1-8b-instruct',
  description:
    'Novita AI 是一个提供多种大语言模型与 AI 图像生成的 API 服务的平台，灵活、可靠且具有成本效益。它支持 Llama3、Mistral 等最新的开源模型，并为生成式 AI 应用开发提供了全面、用户友好且自动扩展的 API 解决方案，适合 AI 初创公司的快速发展。',
  disableBrowserRequest: true,
  id: 'novita',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://novita.ai/model-api/product/llm-api',
  name: 'Novita',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://api.novita.ai/v3/openai',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://novita.ai',
};

export default Novita;
