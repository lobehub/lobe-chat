import { ModelProviderCard } from '@/types/llm';

// ref https://console.groq.com/docs/tool-use
const Groq: ModelProviderCard = {
  chatModels: [],
  checkModel: 'llama-3.1-8b-instant',
  description:
    'Groq 的 LPU 推理引擎在最新的独立大语言模型（LLM）基准测试中表现卓越，以其惊人的速度和效率重新定义了 AI 解决方案的标准。Groq 是一种即时推理速度的代表，在基于云的部署中展现了良好的性能。',
  id: 'groq',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://console.groq.com/docs/models',
  name: 'Groq',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.groq.com/openai/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://groq.com',
};

export default Groq;
