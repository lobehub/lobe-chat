import { ModelProviderCard } from '@/types/llm';

// ref https://console.groq.com/docs/models
// ref https://console.groq.com/docs/tool-use
const Groq: ModelProviderCard = {
  chatModels: [
    // TODO: During preview launch, Groq is limiting 3.1 models to max_tokens of 8k.
    {
      displayName: 'Llama 3.1 8B (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama-3.1-8b-instant',
      tokens: 131_072,
    },
    {
      displayName: 'Llama 3.1 70B (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama-3.1-70b-versatile',
      tokens: 131_072,
    },
/*
    // Offline due to overwhelming demand! Stay tuned for updates.
    {
      displayName: 'Llama 3.1 405B (Preview)',
      functionCall: true,
      id: 'llama-3.1-405b-reasoning',
      tokens: 8_192,
    },
*/
    {
      displayName: 'Llama 3 Groq 8B Tool Use (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama3-groq-8b-8192-tool-use-preview',
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 Groq 70B Tool Use (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama3-groq-70b-8192-tool-use-preview',
      tokens: 8192,
    },
    {
      displayName: 'Meta Llama 3 8B',
      enabled: true,
      functionCall: true,
      id: 'llama3-8b-8192',
      tokens: 8192,
    },
    {
      displayName: 'Meta Llama 3 70B',
      enabled: true,
      functionCall: true,
      id: 'llama3-70b-8192',
      tokens: 8192,
    },
    {
      displayName: 'Gemma 2 9B',
      enabled: true,
      functionCall: true,
      id: 'gemma2-9b-it',
      tokens: 8192,
    },
    {
      displayName: 'Gemma 7B',
      functionCall: true,
      id: 'gemma-7b-it',
      tokens: 8192,
    },
    {
      displayName: 'Mixtral 8x7B',
      enabled: true,
      functionCall: true,
      id: 'mixtral-8x7b-32768',
      tokens: 32_768,
    },
    {
      displayName: 'LLaVA 1.5 7B',
      enabled: true,
      id: 'llava-v1.5-7b-4096-preview',
      tokens: 4096,
      vision: true,
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
