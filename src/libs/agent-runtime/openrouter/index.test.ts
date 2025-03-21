// @vitest-environment node
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenAICompatibleRuntime } from '@/libs/agent-runtime';
import { testProvider } from '@/libs/agent-runtime/providerTestUtils';

import models from './fixtures/models.json';
import { LobeOpenRouterAI } from './index';

const provider = 'openrouter';
const defaultBaseURL = 'https://openrouter.ai/api/v1';

testProvider({
  provider,
  defaultBaseURL,
  chatModel: 'mistralai/mistral-7b-instruct:free',
  Runtime: LobeOpenRouterAI,
  chatDebugEnv: 'DEBUG_OPENROUTER_CHAT_COMPLETION',
  test: {
    skipAPICall: true,
  },
});

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeOpenRouterAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
  vi.spyOn(instance['client'].models, 'list').mockResolvedValue({ data: [] } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LobeOpenRouterAI', () => {
  describe('init', () => {
    it('should correctly initialize with a custom base URL', async () => {
      const instance = new LobeOpenRouterAI({
        apiKey: 'test_api_key',
        baseURL: 'https://api.abc.com/v1',
      });
      expect(instance).toBeInstanceOf(LobeOpenRouterAI);
      expect(instance.baseURL).toEqual('https://api.abc.com/v1');
    });
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'mistralai/mistral-7b-instruct:free',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    it('should call OpenRouter API with corresponding options', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        max_tokens: 1024,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'mistralai/mistral-7b-instruct:free',
        temperature: 0.7,
        top_p: 1,
      });

      // Assert
      expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          max_tokens: 1024,
          messages: [{ content: 'Hello', role: 'user' }],
          stream: true,
          model: 'mistralai/mistral-7b-instruct:free',
          temperature: 0.7,
          top_p: 1,
        }),
        { headers: { Accept: '*/*' } },
      );
      expect(result).toBeInstanceOf(Response);
    });

    it('should add reasoning field when thinking is enabled', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'mistralai/mistral-7b-instruct:free',
        temperature: 0.7,
        thinking: {
          type: 'enabled',
          budget_tokens: 1500,
        },
      });

      // Assert
      expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'mistralai/mistral-7b-instruct:free',
          reasoning: {
            max_tokens: 1500,
          },
          temperature: 0.7,
        }),
        { headers: { Accept: '*/*' } },
      );
      expect(result).toBeInstanceOf(Response);
    });
  });

  describe('models', () => {
    it('should get models', async () => {
      // mock the models.list method
      (instance['client'].models.list as Mock).mockResolvedValue({ data: models });

      const list = await instance.models();

      expect(list).toMatchSnapshot();
    });
  });
});
