import { ModelProviderCard } from '@/types/llm';

const Ollama: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Llama2 7B',
      functionCall: false,
      id: 'llama2',
      vision: false,
    },
    {
      displayName: 'Mistral',
      functionCall: false,
      id: 'mistral',
      vision: false,
    },
    {
      displayName: 'Qwen 7B Chat',
      functionCall: false,
      id: 'qwen:7b-chat',
      vision: false,
    },
  ],
  id: 'ollama',
};

export default Ollama;
