// @vitest-environment node
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeOpenAICompatibleRuntime } from '@/libs/model-runtime';
import { testProvider } from '@/libs/model-runtime/providerTestUtils';

import frontendModels from './fixtures/frontendModels.json';
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
    it('should get models with frontend models data', async () => {
      // mock the models.list method
      (instance['client'].models.list as Mock).mockResolvedValue({ data: models });

      // 模拟成功的 fetch 响应
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: vi.fn().mockResolvedValue(frontendModels),
        }),
      );

      const list = await instance.models();

      // 验证 fetch 被正确调用
      expect(fetch).toHaveBeenCalledWith('https://openrouter.ai/api/frontend/models');

      // 验证模型列表中包含了从前端 API 获取的额外信息
      const reflectionModel = list.find((model) => model.id === 'mattshumer/reflection-70b:free');
      expect(reflectionModel).toBeDefined();
      expect(reflectionModel?.reasoning).toBe(true);
      expect(reflectionModel?.functionCall).toBe(true);

      expect(list).toMatchSnapshot();
    });

    it('should handle fetch failure gracefully', async () => {
      // mock the models.list method
      (instance['client'].models.list as Mock).mockResolvedValue({ data: models });

      // 模拟失败的 fetch 响应
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
        }),
      );

      const list = await instance.models();

      // 验证即使 fetch 失败，方法仍然能返回有效的模型列表
      expect(fetch).toHaveBeenCalledWith('https://openrouter.ai/api/frontend/models');
      expect(list.length).toBeGreaterThan(0); // 确保返回了模型列表
      expect(list).toMatchSnapshot();
    });

    it('should handle fetch error gracefully', async () => {
      // mock the models.list method
      (instance['client'].models.list as Mock).mockResolvedValue({ data: models });

      // 在测试环境中，需要先修改 fetch 的实现，确保错误被捕获
      vi.spyOn(global, 'fetch').mockImplementation(() => {
        throw new Error('Network error');
      });

      const list = await instance.models();

      // 验证即使 fetch 出错，方法仍然能返回有效的模型列表
      expect(list.length).toBeGreaterThan(0); // 确保返回了模型列表
      expect(list).toMatchSnapshot();
    });
  });
});
