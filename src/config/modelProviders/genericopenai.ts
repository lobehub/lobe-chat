import { ModelProviderCard } from '@/types/llm';

// ref https://platform.openai.com/docs/models
const GenericOpenAI: ModelProviderCard = {
  chatModels: [
    {
      description: 'llama-3-8b-lexi',
      displayName: 'lexi-llama3-8b',
      enabled: true,
      functionCall: false,
      id: 'llama-3-8b',
      tokens: 8192,
      vision: false,
    },
    {
      description: 'mistral-nemo-12b',
      displayName: 'mistral-nemo-12b',
      enabled: true,
      functionCall: true,
      id: 'mistral-nemo-12b',
      tokens: 128_000,
      vision: false,
    },
    {
      description: 'codegexx4-all-9b',
      displayName: 'codegexx4-all-9b',
      enabled: true,
      functionCall: true,
      id: 'codegexx4-all-9b',
      tokens: 128_000,
      vision: false,
    },
  ],
  checkModel: 'llama-3-8b',
  enabled: true,
  id: 'genericopenai',
  modelList: { showModelFetcher: true },
  name: 'GenericOpenAI',
};

export default GenericOpenAI;
