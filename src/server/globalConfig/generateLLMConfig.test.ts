import { generateLLMConfig } from './generateLLMConfig';
import { describe, expect, it, vi } from 'vitest';

// Mock ModelProvider enum
vi.mock('@/libs/agent-runtime', () => ({
  ModelProvider: {
    Azure: 'azure',
    Bedrock: 'bedrock',
    Ollama: 'ollama',
  }
}));

// Mock ProviderCards
vi.mock('@/config/modelProviders', () => ({
  azureProviderCard: {
    chatModels: [],
  },
  bedrockProviderCard: {
    chatModels: ['bedrockModel1', 'bedrockModel2'],
  },
  ollamaProviderCard: {
    chatModels: ['ollamaModel1', 'ollamaModel2'],
  },
}));

// Mock LLM config
vi.mock('@/config/llm', () => ({
  getLLMConfig: () => ({
    ENABLED_AZURE_OPENAI: true,
    ENABLED_AWS_BEDROCK: true,
    ENABLED_OLLAMA: true,
    AZURE_MODEL_LIST: 'azureModels',
    AWS_BEDROCK_MODEL_LIST: 'bedrockModels',
    OLLAMA_MODEL_LIST: 'ollamaModels',
    OLLAMA_PROXY_URL: '',
  }),
}));

// Mock parse models utils
vi.mock('@/utils/parseModels', () => ({
  extractEnabledModels: (modelString: string, withDeploymentName?: boolean) => [modelString],
  transformToChatModelCards: ({ defaultChatModels, modelString, withDeploymentName }: any) => defaultChatModels,
}));

describe('generateLLMConfig', () => {
  it('should generate correct LLM config for Azure, Bedrock, and Ollama', () => {
    const config = generateLLMConfig();
    
    expect(config.azure).toEqual({
      enabled: true,
      enabledModels: ['azureModels'],
      serverModelCards: [],
    });

    expect(config.bedrock).toEqual({
      enabled: true,
      enabledModels: ['bedrockModels'],
      serverModelCards: ['bedrockModel1', 'bedrockModel2'],
    });

    expect(config.ollama).toEqual({
      enabled: true,
      enabledModels: ['ollamaModels'], 
      fetchOnClient: true,
      serverModelCards: ['ollamaModel1', 'ollamaModel2'],
    });
  });
});
