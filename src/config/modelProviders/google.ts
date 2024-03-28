import { ModelProviderCard } from '@/types/llm';

const Google: ModelProviderCard = {
  chatModels: [
    {
      displayName: 'Gemini Pro',
      id: 'gemini-pro',
      tokens: 30_720,
    },
    {
      displayName: 'Gemini Pro Vision',
      id: 'gemini-pro-vision',
      tokens: 12_288,
      vision: true,
    },
    {
      displayName: 'Gemini 1.5 Pro',
      id: 'gemini-1.5-pro-latest',
      tokens: 1_048_576,
    },
    {
      displayName: 'Gemini Ultra',
      id: 'gemini-ultra-latest',
      tokens: 30_720,
    },
  ],
  id: 'google',
};

export default Google;
