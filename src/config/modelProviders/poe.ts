import { ModelProviderCard } from '@/types/llm';

// ref: https://poe.com/
const Poe: ModelProviderCard = {
  chatModels: [
    {
      description: 'Claude-3.5-Sonnet on Poe platform - Advanced reasoning and code generation',
      displayName: 'Claude-3.5-Sonnet',
      enabled: true,
      functionCall: true,
      id: 'Claude-3.5-Sonnet',
      vision: true,
    },
    {
      description: 'Claude-3-Opus on Poe platform - Most capable Claude model',
      displayName: 'Claude-3-Opus',
      enabled: true,
      functionCall: true,
      id: 'Claude-3-Opus',
      vision: true,
    },
    {
      description: 'Claude-3-Sonnet on Poe platform - Balanced performance and cost',
      displayName: 'Claude-3-Sonnet',
      enabled: true,
      functionCall: true,
      id: 'Claude-3-Sonnet',
      vision: true,
    },
    {
      description: 'Claude-3-Haiku on Poe platform - Fast and efficient',
      displayName: 'Claude-3-Haiku',
      enabled: true,
      functionCall: true,
      id: 'Claude-3-Haiku',
      vision: true,
    },
    {
      description: 'GPT-4o on Poe platform - Latest GPT-4 model with multimodal capabilities',
      displayName: 'GPT-4o',
      enabled: true,
      functionCall: true,
      id: 'GPT-4o',
      vision: true,
    },
    {
      description: 'GPT-4-Turbo on Poe platform - Advanced GPT-4 with improved performance',
      displayName: 'GPT-4-Turbo',
      enabled: true,
      functionCall: true,
      id: 'GPT-4-Turbo',
      vision: true,
    },
    {
      description: 'Gemini-Pro on Poe platform - Google\'s advanced multimodal model',
      displayName: 'Gemini-Pro',
      enabled: true,
      functionCall: true,
      id: 'Gemini-Pro',
      vision: true,
    },
  ],
  description:
    'Poe by Quora provides access to multiple AI models including Claude, GPT-4, and Gemini through a unified API. Poe offers a convenient way to access various leading AI models with consistent API interface.',
  enabled: true,
  id: 'poe',
  modelList: { showModelFetcher: true },
  name: 'Poe',
  proxyUrl: {
    placeholder: 'https://api.poe.com',
  },
  settings: {
    proxyUrl: {
      placeholder: 'https://api.poe.com',
    },
    showModelFetcher: true,
  },
  url: 'https://poe.com',
};

export default Poe;