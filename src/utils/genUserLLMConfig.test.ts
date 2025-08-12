import { describe, expect, it, vi } from 'vitest';

import { ModelProviderCard } from '@/types/llm';

import { genUserLLMConfig } from './genUserLLMConfig';

// Mock ModelProvider enum
vi.mock('@lobechat/model-runtime', () => ({
  ModelProvider: {
    Ollama: 'ollama',
    OpenAI: 'openai',
  },
}));

// Mock ProviderCards and filterEnabledModels
vi.mock('@/config/modelProviders', () => ({
  OllamaProviderCard: {
    chatModels: ['ollamaModel1', 'ollamaModel2'],
  },
  OpenAIProviderCard: {
    chatModels: ['openaiModel1', 'openaiModel2'],
  },
  filterEnabledModels: (providerCard: ModelProviderCard) => providerCard.chatModels,
}));

describe('genUserLLMConfig', () => {
  it('should generate correct LLM config for Ollama and OpenAI', () => {
    const specificConfig = {
      ollama: { enabled: true, fetchOnClient: true },
      openai: { enabled: true },
    };
    const config = genUserLLMConfig(specificConfig);

    expect(config.ollama).toEqual({
      enabled: true,
      enabledModels: ['ollamaModel1', 'ollamaModel2'],
      fetchOnClient: true,
    });

    expect(config.openai).toEqual({
      enabled: true,
      enabledModels: ['openaiModel1', 'openaiModel2'],
    });
  });
});
