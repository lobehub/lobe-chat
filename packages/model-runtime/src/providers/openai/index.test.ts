// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as debugStreamModule from '../../utils/debugStream';
import officalOpenAIModels from './fixtures/openai-models.json';
import { LobeOpenAI } from './index';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock fetch for most tests, but will be restored for real network tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('LobeOpenAI', () => {
  let instance: InstanceType<typeof LobeOpenAI>;

  beforeEach(() => {
    instance = new LobeOpenAI({ apiKey: 'test' });

    // 使用 vi.spyOn 来模拟 chat.completions.create 方法
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
    vi.spyOn(instance['client'].models, 'list').mockResolvedValue({ data: [] } as any);

    // Mock responses.create for responses API tests
    vi.spyOn(instance['client'].responses, 'create').mockResolvedValue(new ReadableStream() as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
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
        model: 'text-davinci-003',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    describe('Error', () => {
      it('should return ProviderBizError with an openai error response when OpenAI.APIError is thrown', async () => {
        // Arrange
        const apiError = new OpenAI.APIError(
          400,
          {
            status: 400,
            error: {
              message: 'Bad Request',
            },
          },
          'Error message',
          {},
        );

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.openai.com/v1',
            error: {
              error: { message: 'Bad Request' },
              status: 400,
            },
            errorType: 'ProviderBizError',
            provider: 'openai',
          });
        }
      });

      it('should throw AgentRuntimeError with NoOpenAIAPIKey if no apiKey is provided', async () => {
        try {
          new LobeOpenAI({});
        } catch (e) {
          expect(e).toEqual({ errorType: 'InvalidProviderAPIKey' });
        }
      });

      it('should return ProviderBizError with the cause when OpenAI.APIError is thrown with cause', async () => {
        // Arrange
        const errorInfo = {
          cause: {
            message: 'api is undefined',
          },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.openai.com/v1',
            error: {
              cause: { message: 'api is undefined' },
            },
            errorType: 'ProviderBizError',
            provider: 'openai',
          });
        }
      });

      it('should return ProviderBizError with an cause response with desensitize Url', async () => {
        // Arrange
        const errorInfo = {
          cause: { message: 'api is undefined' },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        instance = new LobeOpenAI({
          apiKey: 'test',

          baseURL: 'https://api.abc.com/v1',
        });

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'gpt-3.5-turbo',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.***.com/v1',
            error: {
              cause: { message: 'api is undefined' },
            },
            errorType: 'ProviderBizError',
            provider: 'openai',
          });
        }
      });

      it('should return AgentRuntimeError for non-OpenAI errors', async () => {
        // Arrange
        const genericError = new Error('Generic Error');

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(genericError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.openai.com/v1',
            errorType: 'AgentRuntimeError',
            provider: 'openai',
            error: {
              name: genericError.name,
              cause: genericError.cause,
              message: genericError.message,
            },
          });
        }
      });
    });

    describe('DEBUG', () => {
      it('should call debugStream and return StreamingTextResponse when DEBUG_OPENAI_CHAT_COMPLETION is 1', async () => {
        // Arrange
        const mockProdStream = new ReadableStream() as any; // 模拟的 prod 流
        const mockDebugStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Debug stream content');
            controller.close();
          },
        }) as any;
        mockDebugStream.toReadableStream = () => mockDebugStream; // 添加 toReadableStream 方法

        // 模拟 chat.completions.create 返回值，包括模拟的 tee 方法
        (instance['client'].chat.completions.create as Mock).mockResolvedValue({
          tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
        });

        // 保存原始环境变量值
        const originalDebugValue = process.env.DEBUG_OPENAI_CHAT_COMPLETION;

        // 模拟环境变量
        process.env.DEBUG_OPENAI_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // 执行测试
        // 运行你的测试函数，确保它会在条件满足时调用 debugStream
        // 假设的测试函数调用，你可能需要根据实际情况调整
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
        });

        // 验证 debugStream 被调用
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // 恢复原始环境变量值
        process.env.DEBUG_OPENAI_CHAT_COMPLETION = originalDebugValue;
      });
    });
  });

  describe('models', () => {
    it('should get models', async () => {
      // mock the models.list method
      (instance['client'].models.list as Mock).mockResolvedValue({ data: officalOpenAIModels });

      const list = await instance.models();

      expect(list).toMatchSnapshot();
    });
  });

  describe('responses.handlePayload', () => {
    it('should add web_search tool when enabledSearch is true', async () => {
      const payload = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'gpt-4o', // 使用常规模型，通过 enabledSearch 触发 responses API
        temperature: 0.7,
        enabledSearch: true,
        tools: [{ type: 'function' as const, function: { name: 'test', description: 'test' } }],
      };

      await instance.chat(payload);

      const createCall = (instance['client'].responses.create as Mock).mock.calls[0][0];
      expect(createCall.tools).toEqual([
        { type: 'function', name: 'test', description: 'test' },
        { type: 'web_search' },
      ]);
    });

    it('should handle computer-use models with truncation and reasoning', async () => {
      const payload = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'computer-use-preview',
        temperature: 0.7,
        reasoning: { effort: 'medium' },
      };

      await instance.chat(payload);

      const createCall = (instance['client'].responses.create as Mock).mock.calls[0][0];
      expect(createCall.truncation).toBe('auto');
      expect(createCall.reasoning).toEqual({ effort: 'medium', summary: 'auto' });
    });

    it('should handle prunePrefixes models without computer-use truncation', async () => {
      const payload = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'o1-pro', // prunePrefixes 模型但非 computer-use
        temperature: 0.7,
      };

      await instance.chat(payload);

      const createCall = (instance['client'].responses.create as Mock).mock.calls[0][0];
      expect(createCall.reasoning).toEqual({ summary: 'auto' });
      expect(createCall.truncation).toBeUndefined();
    });
  });
});
