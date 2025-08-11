import { ModelProviderCard } from '@/types/llm';

// ref :https://developers.upstage.ai/docs/getting-started/models
const Upstage: ModelProviderCard = {
  chatModels: [],
  checkModel: 'solar-1-mini-chat',
  description:
    'Upstage 专注于为各种商业需求开发AI模型，包括 Solar LLM 和文档 AI，旨在实现工作的人造通用智能（AGI）。通过 Chat API 创建简单的对话代理，并支持功能调用、翻译、嵌入以及特定领域应用。',
  id: 'upstage',
  modelsUrl: 'https://developers.upstage.ai/docs/getting-started/models',
  name: 'Upstage',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.upstage.ai/v1/solar',
    },
    sdkType: 'openai',
  },
  url: 'https://upstage.ai',
};

export default Upstage;
