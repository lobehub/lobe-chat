import { ModelProviderCard } from '@/types/llm';

const Google: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Gemini Pro',
      id: 'gemini-pro',
      tokens: 32_768,
    },
    {
      displayName: 'Gemini Pro Vision',
      id: 'gemini-pro-vision',
      tokens: 16_384,
      vision: true,
    },
  ],
  id: 'google',
};

export default Google;
