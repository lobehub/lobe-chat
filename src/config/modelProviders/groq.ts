import { ModelProviderCard } from '@/types/llm';

// ref https://console.groq.com/docs/tool-use
const Groq: ModelProviderCard = {
  chatModels: [
    // TODO: During preview launch, Groq is limiting 3.1 models to max_tokens of 8k.
    {
      displayName: 'Llama 3.1 8B (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama-3.1-8b-instant',
      maxOutput: 8192,
      pricing: {
        input: 0.05,
        output: 0.08,
      },
      tokens: 131_072,
    },
    {
      displayName: 'Llama 3.1 70B (Preview)',
      enabled: true,
      functionCall: true,
      id: 'llama-3.1-70b-versatile',
      maxOutput: 8192,
      pricing: {
        input: 0.59,
        output: 0.79,
      },
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
      displayName: 'Llama 3 Groq 8B Tool Use Preview 8K',
      enabled: true,
      functionCall: true,
      id: 'llama3-groq-8b-8192-tool-use-preview',
      pricing: {
        input: 0.19,
        output: 0.19,
      },
      tokens: 8192,
    },
    {
      displayName: 'Llama 3 Groq 70B Tool Use Preview 8K',
      enabled: true,
      functionCall: true,
      id: 'llama3-groq-70b-8192-tool-use-preview',
      pricing: {
        input: 0.89,
        output: 0.89,
      },
      tokens: 8192,
    },
    {
      displayName: 'Meta Llama 3 8B',
      enabled: true,
      functionCall: true,
      id: 'llama3-8b-8192',
      pricing: {
        input: 0.05,
        output: 0.08,
      },
      tokens: 8192,
    },
    {
      displayName: 'Meta Llama 3 70B',
      enabled: true,
      functionCall: true,
      id: 'llama3-70b-8192',
      pricing: {
        input: 0.59,
        output: 0.79,
      },
      tokens: 8192,
    },
    {
      displayName: 'Gemma 2 9B 8k',
      enabled: true,
      functionCall: true,
      id: 'gemma2-9b-it',
      pricing: {
        input: 0.2,
        output: 0.2,
      },
      tokens: 8192,
    },
    {
      displayName: 'Gemma 7B 8k Instruct',
      functionCall: true,
      id: 'gemma-7b-it',
      pricing: {
        input: 0.07,
        output: 0.07,
      },
      tokens: 8192,
    },
    {
      displayName: 'Mixtral 8x7B Instruct 32k',
      enabled: true,
      functionCall: true,
      id: 'mixtral-8x7b-32768',
      pricing: {
        input: 0.24,
        output: 0.24,
      },
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
  modelsUrl: 'https://console.groq.com/docs/models',
  name: 'Groq',
  proxyUrl: {
    placeholder: 'https://api.groq.com/openai/v1',
  },
  url: 'https://groq.com',
};

export default Groq;
