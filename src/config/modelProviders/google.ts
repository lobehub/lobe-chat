import { ModelProviderCard } from '@/types/llm';

// ref https://ai.google.dev/models/gemini
// api https://ai.google.dev/api/rest/v1beta/models/list
const Google: ModelProviderCard = {
  chatModels: [
    {
      description: 'A legacy text-only model optimized for chat conversations',
      displayName: 'PaLM 2 Chat (Legacy)',
      id: 'chat-bison-001',
      maxOutput: 1024,
      // tokens: 4096 + 1024, // none tokens test
    },
    {
      description: 'A legacy model that understands text and generates text as an output',
      displayName: 'PaLM 2 (Legacy)',
      id: 'text-bison-001',
      maxOutput: 1024,
      tokens: 8196 + 1024,
    },
    {
      description: 'The best model for scaling across a wide range of tasks',
      displayName: 'Gemini 1.0 Pro',
      enabled: true,
      id: 'gemini-pro',
      maxOutput: 2048,
      tokens: 30_720 + 2048,
    },
    {
      description: 'The best image understanding model to handle a broad range of applications',
      displayName: 'Gemini 1.0 Pro Vision',
      id: 'gemini-1.0-pro-vision-latest',
      maxOutput: 4096,
      tokens: 12_288 + 4096,
      vision: true,
    },
    {
      description: 'The best image understanding model to handle a broad range of applications',
      displayName: 'Gemini 1.0 Pro Vision',
      enabled: true,
      id: 'gemini-pro-vision',
      maxOutput: 4096,
      tokens: 12_288 + 4096,
      vision: true,
    },
    {
      description:
        'The best model for scaling across a wide range of tasks. This is a stable model that supports tuning.',
      displayName: 'Gemini 1.0 Pro 001 (Tuning)',
      id: 'gemini-1.0-pro-001',
      maxOutput: 2048,
      tokens: 30_720 + 2048,
    },
    {
      description:
        'The best model for scaling across a wide range of tasks. Released April 9, 2024.',
      displayName: 'Gemini 1.0 Pro 002 (Tuning)',
      id: 'gemini-1.0-pro-002',
      maxOutput: 2048,
      tokens: 30_720 + 2048,
    },
    {
      description:
        'The best model for scaling across a wide range of tasks. This is the latest model.',
      displayName: 'Gemini 1.0 Pro Latest',
      id: 'gemini-1.0-pro-latest',
      maxOutput: 2048,
      tokens: 30_720 + 2048,
    },
    {
      description: 'Mid-size multimodal model that supports up to 1 million tokens',
      displayName: 'Gemini 1.5 Pro',
      enabled: true,
      id: 'gemini-1.5-pro-latest',
      maxOutput: 8192,
      tokens: 1_048_576 + 8192,
      vision: true,
    },
    {
      description: 'The most capable model for highly complex tasks',
      displayName: 'Gemini 1.0 Ultra',
      id: 'gemini-ultra',
      maxOutput: 2048,
      tokens: 32_768,
    },
  ],
  id: 'google',
};

export default Google;
