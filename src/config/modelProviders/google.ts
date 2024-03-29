import { ModelProviderCard } from '@/types/llm';

const Google: ModelProviderCard = {
  chatModels: [
    {
      description: 'A legacy text-only model optimized for chat conversations',
      displayName: 'PaLM 2 Chat (Legacy)',
      hidden: true,
      id: 'chat-bison-001',
      maxOutput: 1024,
      tokens: 5120,
    },
    {
      description: 'A legacy model that understands text and generates text as an output',
      displayName: 'PaLM 2 (Legacy)',
      hidden: true,
      id: 'text-bison-001',
      maxOutput: 1024,
      tokens: 9220,
    },
    {
      description: 'The best model for scaling across a wide range of tasks',
      displayName: 'Gemini 1.0 Pro',
      id: 'gemini-pro',
      maxOutput: 2048,
      tokens: 32_768,
    },
    {
      description: 'The best image understanding model to handle a broad range of applications',
      displayName: 'Gemini 1.0 Pro Vision',
      id: 'gemini-1.0-pro-vision-latest',
      maxOutput: 4096,
      tokens: 16_384,
      vision: true,
    },
    {
      description: 'The best image understanding model to handle a broad range of applications',
      displayName: 'Gemini 1.0 Pro Vision',
      hidden: true,
      id: 'gemini-pro-vision',
      maxOutput: 4096,
      tokens: 16_384,
      vision: true,
    },
    {
      description: 'The best model for scaling across a wide range of tasks',
      displayName: 'Gemini 1.0 Pro',
      hidden: true,
      id: '1.0-pro',
      maxOutput: 2048,
      tokens: 32_768,
    },
    {
      description:
        'The best model for scaling across a wide range of tasks. This is a stable model that supports tuning.',
      displayName: 'Gemini 1.0 Pro 001 (Tuning)',
      hidden: true,
      id: 'gemini-1.0-pro-001',
      maxOutput: 2048,
      tokens: 32_768,
    },
    {
      description:
        'The best model for scaling across a wide range of tasks. This is the latest model.',
      displayName: 'Gemini 1.0 Pro Latest',
      hidden: true,
      id: 'gemini-1.0-pro-latest',
      maxOutput: 2048,
      tokens: 32_768,
    },
    {
      description: 'Mid-size multimodal model that supports up to 1 million tokens',
      displayName: 'Gemini 1.5 Pro',
      id: 'gemini-1.5-pro-latest',
      maxOutput: 8192,
      tokens: 1_056_768,
      vision: true,
    },
    {
      description: 'The most capable model for highly complex tasks',
      displayName: 'Gemini 1.0 Ultra',
      hidden: true,
      id: 'gemini-ultra-latest',
      maxOutput: 2048,
      tokens: 32_768,
    },
  ],
  id: 'google',
};

export default Google;
