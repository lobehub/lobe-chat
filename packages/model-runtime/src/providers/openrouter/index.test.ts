// @vitest-environment node
import { LobeOpenAICompatibleRuntime } from '@lobechat/model-runtime';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
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
vi.spyOn(console, 'error').mockImplementation(() => { });

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeOpenRouterAI({ apiKey: 'test' });

  // 用一个完整的假 client 覆盖实例的 client，避免访问深层属性时出现初始化顺序问题
  instance['client'] = {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue(Promise.resolve(new ReadableStream())),
      },
    },
    models: {
      list: vi.fn().mockResolvedValue({ data: [] }),
    },
  } as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LobeOpenRouterAI', () => {
  describe('init', () => {
    it('should correctly initialize with a custom base URL', async () => {
      const inst = new LobeOpenRouterAI({
        apiKey: 'test_api_key',
        baseURL: 'https://api.abc.com/v1',
      });
      expect(inst).toBeInstanceOf(LobeOpenRouterAI);
      expect(inst.baseURL).toEqual('https://api.abc.com/v1');
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

      // 验证在当前实现中，当 model fetch 返回非 ok 时，会返回空列表
      expect(fetch).toHaveBeenCalledWith('https://openrouter.ai/api/v1/models');
      expect(list.length).toBe(0);
      expect(list).toEqual([]);
    });

    it('should handle fetch error gracefully', async () => {
      // mock the models.list method
      (instance['client'].models.list as Mock).mockResolvedValue({ data: models });

      // 在测试环境中，需要先修改 fetch 的实现，确保错误被捕获
      vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
        throw new Error('Network error');
      });

      const list = await instance.models();

      // 验证在当前实现中，当 frontend fetch 抛错时，会返回空列表
      expect(list.length).toBe(0);
      expect(list).toEqual([]);
    });
  });
});
