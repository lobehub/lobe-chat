import { describe, expect, it } from 'vitest';

import {
  type AgentInitErrorPayload,
  type ChatCompletionErrorPayload,
  type CreateChatCompletionOptions,
  type CreateImageErrorPayload,
  ModelProvider,
  type ModelProviderKey,
} from './type';

describe('ModelProvider', () => {
  it('should have all expected provider values', () => {
    const expectedProviders = [
      'ai21',
      'ai302',
      'ai360',
      'aihubmix',
      'akashchat',
      'anthropic',
      'azure',
      'azureai',
      'baichuan',
      'bedrock',
      'cloudflare',
      'cohere',
      'cometapi',
      'deepseek',
      'fal',
      'fireworksai',
      'giteeai',
      'github',
      'google',
      'groq',
      'higress',
      'huggingface',
      'hunyuan',
      'infiniai',
      'internlm',
      'jina',
      'lmstudio',
      'lobehub',
      'minimax',
      'mistral',
      'modelscope',
      'moonshot',
      'nebius',
      'newapi',
      'novita',
      'nvidia',
      'ollama',
      'openai',
      'openrouter',
      'ppio',
      'perplexity',
      'qiniu',
      'qwen',
      'sambanova',
      'search1api',
      'sensenova',
      'siliconcloud',
      'spark',
      'stepfun',
      'taichu',
      'tencentcloud',
      'togetherai',
      'upstage',
      'v0',
      'vllm',
      'vertexai',
      'volcengine',
      'wenxin',
      'xai',
      'xinference',
      'zeroone',
      'zhipu',
    ];

    const actualProviders = Object.values(ModelProvider);
    expect(actualProviders).toHaveLength(expectedProviders.length);

    expectedProviders.forEach((provider) => {
      expect(actualProviders).toContain(provider);
    });
  });

  it('should have consistent enum keys and values', () => {
    expect(ModelProvider.OpenAI).toBe('openai');
    expect(ModelProvider.Anthropic).toBe('anthropic');
    expect(ModelProvider.Google).toBe('google');
    expect(ModelProvider.Bedrock).toBe('bedrock');
    expect(ModelProvider.Azure).toBe('azure');
    expect(ModelProvider.Ollama).toBe('ollama');
    expect(ModelProvider.DeepSeek).toBe('deepseek');
    expect(ModelProvider.Groq).toBe('groq');
    expect(ModelProvider.Minimax).toBe('minimax');
    expect(ModelProvider.Moonshot).toBe('moonshot');
  });

  it('should be a valid enum object', () => {
    expect(typeof ModelProvider).toBe('object');
    expect(ModelProvider).not.toBeNull();
  });
});

describe('ModelProviderKey', () => {
  it('should be lowercase string type', () => {
    const providerKey: ModelProviderKey = 'openai';
    expect(typeof providerKey).toBe('string');
    expect(providerKey).toBe(providerKey.toLowerCase());
  });
});

describe('Error payload interfaces', () => {
  describe('AgentInitErrorPayload', () => {
    it('should define AgentInitErrorPayload correctly', () => {
      const payload: AgentInitErrorPayload = {
        error: { message: 'Init failed' },
        errorType: 'InvalidAPIKey',
      };

      expect(payload.error).toEqual({ message: 'Init failed' });
      expect(payload.errorType).toBe('InvalidAPIKey');
    });

    it('should allow numeric errorType', () => {
      const payload: AgentInitErrorPayload = {
        error: new Error('Network error'),
        errorType: 500,
      };

      expect(payload.error).toBeInstanceOf(Error);
      expect(payload.errorType).toBe(500);
    });
  });

  describe('ChatCompletionErrorPayload', () => {
    it('should define ChatCompletionErrorPayload correctly', () => {
      const payload: ChatCompletionErrorPayload = {
        error: { message: 'Chat completion failed' },
        errorType: 'InvalidProviderAPIKey',
        provider: 'openai',
      };

      expect(payload.error).toEqual({ message: 'Chat completion failed' });
      expect(payload.errorType).toBe('InvalidProviderAPIKey');
      expect(payload.provider).toBe('openai');
    });

    it('should allow additional properties', () => {
      const payload: ChatCompletionErrorPayload = {
        error: { code: 'RATE_LIMIT' },
        errorType: 'QuotaLimitReached',
        provider: 'anthropic',
        endpoint: 'https://api.anthropic.com/v1/messages',
        customField: 'custom value',
      };

      expect(payload.endpoint).toBe('https://api.anthropic.com/v1/messages');
      expect(payload.customField).toBe('custom value');
    });
  });

  describe('CreateImageErrorPayload', () => {
    it('should define CreateImageErrorPayload correctly', () => {
      const payload: CreateImageErrorPayload = {
        error: { message: 'Image generation failed' },
        errorType: 'ModelNotFound',
        provider: 'dalle',
      };

      expect(payload.error).toEqual({ message: 'Image generation failed' });
      expect(payload.errorType).toBe('ModelNotFound');
      expect(payload.provider).toBe('dalle');
    });
  });
});

describe('CreateChatCompletionOptions', () => {
  it('should define CreateChatCompletionOptions correctly', () => {
    const mockOpenAI = {} as any;
    const mockPayload = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
    } as any;

    const options: CreateChatCompletionOptions = {
      chatModel: mockOpenAI,
      payload: mockPayload,
    };

    expect(options.chatModel).toBe(mockOpenAI);
    expect(options.payload).toBe(mockPayload);
  });
});
