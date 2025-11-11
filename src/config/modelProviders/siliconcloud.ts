import { ModelProviderCard } from '@/types/llm';

// ref: https://siliconflow.cn/zh-cn/pricing
const SiliconCloud: ModelProviderCard = {
  chatModels: [],
  checkModel: 'Pro/Qwen/Qwen2-7B-Instruct',
  description: 'SiliconCloud，基于优秀开源基础模型的高性价比 GenAI 云服务',
  id: 'siliconcloud',
  modelList: { showModelFetcher: true },
  modelsUrl: 'https://siliconflow.cn/zh-cn/models',
  name: 'SiliconCloud',
  settings: {
    proxyUrl: {
      placeholder: 'https://api.siliconflow.cn/v1',
    },
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://siliconflow.cn/zh-cn/siliconcloud',
};

export default SiliconCloud;
