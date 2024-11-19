import { describe, expect, it, vi } from 'vitest';

import { genServerLLMConfig } from './genServerLLMConfig';

import { getLLMConfig } from '@/config/llm';

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
  extractEnabledModels: (modelString: string, withDeploymentName?: boolean) => {
    // Returns different format if withDeploymentName is true
    return withDeploymentName ? [`${modelString}_withDeployment`] : [modelString];
  },
  transformToChatModelCards: ({ defaultChatModels, modelString, withDeploymentName }: any) => {
    // Simulate transformation based on withDeploymentName
    return withDeploymentName ? [`${modelString}_transformed`] : defaultChatModels;
  },
}));

describe('genServerLLMConfig', () => {
  it('should generate correct LLM config for Azure, Bedrock, and Ollama', () => {
    vi.stubEnv('AZURE_MODEL_LIST', 'azureModels');
    vi.stubEnv('AWS_BEDROCK_MODEL_LIST', 'bedrockModels');
    vi.stubEnv('OLLAMA_MODEL_LIST', 'ollamaModels');

    const specificConfig = {
      azure: {
        enabledKey: 'ENABLED_AZURE_OPENAI',
        withDeploymentName: true,
      },
      bedrock: {
        enabledKey: 'ENABLED_AWS_BEDROCK',
        modelListKey: 'AWS_BEDROCK_MODEL_LIST',
      },
      ollama: {
        fetchOnClient: !getLLMConfig().OLLAMA_PROXY_URL,
      },
    };
    const config = genServerLLMConfig(specificConfig);

    expect(config.azure).toEqual({
      enabled: true,
      enabledModels: ['azureModels_withDeployment'],
      serverModelCards: ['azureModels_transformed'],
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
