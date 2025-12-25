import { ModelProviderCard } from '@/types/llm';

const Ollama: ModelProviderCard = {
  chatModels: [],
  checkModel: 'deepseek-r1',
  defaultShowBrowserRequest: true,
  description:
    'Ollama 提供的模型广泛涵盖代码生成、数学运算、多语种处理和对话互动等领域，支持企业级和本地化部署的多样化需求。',
  id: 'ollama',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://ollama.com/library',
  name: 'Ollama',
  settings: {
    defaultShowBrowserRequest: true,
    sdkType: 'ollama',
    showApiKey: false,
    showModelFetcher: true,
  },
  showApiKey: false,
  url: 'https://ollama.com',
};

export default Ollama;
