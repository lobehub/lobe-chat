import { ModelProviderCard } from '@/types/llm';

// ref https://console.groq.com/docs/models
const Groq: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'LLaMA3 70B',
      enabled: true,
      functionCall: true,
      id: 'llama3-70b-8192',
      tokens: 8192,
    },
    {
      displayName: 'Mixtral-8x7b',
      enabled: true,
      functionCall: true,
      id: 'mixtral-8x7b-32768',
      tokens: 32_768,
    },
    {
      displayName: 'Gemma 7B',
      functionCall: true,
      id: 'gemma-7b-it',
      tokens: 8192,
    },
    {
      displayName: 'Gemma2 9B',
      enabled: true,
      functionCall: true,
      id: 'gemma2-9b-it',
      tokens: 8192,
    },
    {
      displayName: 'LLaMA3 8B',
      enabled: true,
      functionCall: true,
      id: 'llama3-8b-8192',
      tokens: 8192,
    },
    {
      displayName: 'LLaMA2-70b-chat',
      id: 'llama2-70b-4096',
      tokens: 4096,
    },
  ],
  checkModel: 'gemma2-9b-it',
  id: 'groq',
  name: 'Groq',
  proxyUrl: {
    placeholder: 'https://api.groq.com/openai/v1',
  },
};

export default Groq;
