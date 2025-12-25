import { ModelProviderCard } from '@/types/llm';

const AkashChat: ModelProviderCard = {
  chatModels: [],
  checkModel: 'Meta-Llama-3-1-8B-Instruct-FP8',
  description: 'Akash 是一个无需许可的云资源市场，与传统云提供商相比，其定价具有竞争力。',
  id: 'akashchat',
  modelsUrl: 'https://chatapi.akash.network/documentation',
  name: 'AkashChat',
  settings: {
    sdkType: 'openai',
    showModelFetcher: true,
  },
  url: 'https://chatapi.akash.network/',
};

export default AkashChat;
