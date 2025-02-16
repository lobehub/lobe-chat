import { ModelProviderCard } from '@/types/llm';

const SambaNova: ModelProviderCard = {
  chatModels: [],
  checkModel: 'Meta-Llama-3.2-1B-Instruct',
  description: 'SambaNova Cloud 可让开发者轻松使用最佳的开源模型，并享受最快的推理速度。',
  disableBrowserRequest: true,
  id: 'sambanova',
  modelsUrl: 'https://cloud.sambanova.ai/plans/pricing',
  name: 'SambaNova',
  settings: {
    disableBrowserRequest: true,
    sdkType: 'openai',
  },
  url: 'https://cloud.sambanova.ai',
};

export default SambaNova; 
