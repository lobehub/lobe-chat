import { ModelProviderCard } from '@/types/llm';

// https://cloud.infini-ai.com/genstudio/model
// All models are currently free
const InfiniAI: ModelProviderCard = {
  chatModels: [],
  checkModel: 'qwen3-8b',
  description:
    '为应用开发者提供高性能、易上手、安全可靠的大模型服务，覆盖从大模型开发到大模型服务化部署的全流程。',
  id: 'infiniai',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://cloud.infini-ai.com/genstudio/model',
  name: 'InfiniAI',
  settings: {
    disableBrowserRequest: true,
    proxyUrl: {
      placeholder: 'https://cloud.infini-ai.com/maas/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://cloud.infini-ai.com/genstudio',
};

export default InfiniAI;
