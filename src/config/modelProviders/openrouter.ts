import { ModelProviderCard } from '@/types/llm';

const OpenRouter: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Mistral 7B Instruct (free)',
      functionCall: false,
      id: 'mistralai/mistral-7b-instruct:free',
      tokens: 32_768,
      vision: false,
    },
    {
      displayName: 'Google: Gemma 7B (free)',
      functionCall: false,
      id: 'google/gemma-7b-it:free',
      tokens: 8192,
      vision: false,
    },
    {
      displayName: 'OpenChat 3.5 (free)',
      functionCall: false,
      id: 'openchat/openchat-7b:free',
      tokens: 8192,
      vision: false,
    },
    {
      displayName: 'Nous: Capybara 7B (free)',
      functionCall: false,
      id: 'nousresearch/nous-capybara-7b:free',
      tokens: 4096,
      vision: false,
    },
    {
      displayName: 'Hugging Face: Zephyr 7B (free)',
      functionCall: false,
      id: 'huggingfaceh4/zephyr-7b-beta:free',
      tokens: 4096,
      vision: false,
    }
  ],
  id: 'openrouter',
};

export default OpenRouter;
