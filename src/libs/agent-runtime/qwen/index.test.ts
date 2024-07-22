// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Qwen from '@/config/modelProviders/qwen';
import { AgentRuntimeErrorType, ModelProvider } from '@/libs/agent-runtime';

import * as debugStreamModule from '../utils/debugStream';
import { LobeQwenAI } from './index';

const provider = ModelProvider.Qwen;
const defaultBaseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const bizErrorType = AgentRuntimeErrorType.ProviderBizError;
const invalidErrorType = AgentRuntimeErrorType.InvalidProviderAPIKey;

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeQwenAI;

beforeEach(() => {
  instance = new LobeQwenAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeQwenAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeQwenAI({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeQwenAI);
      expect(instance.baseURL).toEqual(defaultBaseURL);
    });
  });

  describe('models', () => {
    it('should correctly list available models', async () => {
      const instance = new LobeQwenAI({ apiKey: 'test_api_key' });
      vi.spyOn(instance, 'models').mockResolvedValue(Qwen.chatModels);

      const models = await instance.models();
      expect(models).toEqual(Qwen.chatModels);
    });
  });

  describe('chat', () => {
    describe('Params', () => {
      it('should call llms with proper options', async () => {
        const mockStream = new ReadableStream();
        const mockResponse = Promise.resolve(mockStream);

        (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'qwen-turbo',
          temperature: 0.6,
          top_p: 0.7,
        });

        // Assert
        expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'qwen-turbo',
            temperature: 0.6,
            stream: true,
            top_p: 0.7,
            result_format: 'message',
          },
          { headers: { Accept: '*/*' } },
        );
        expect(result).toBeInstanceOf(Response);
      });

      it('should call vlms with proper options', async () => {
        const mockStream = new ReadableStream();
        const mockResponse = Promise.resolve(mockStream);

        (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'qwen-vl-plus',
          temperature: 0.6,
          top_p: 0.7,
        });

        // Assert
        expect(instance['client'].chat.completions.create).toHaveBeenCalledWith(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'qwen-vl-plus',
            stream: true,
          },
          { headers: { Accept: '*/*' } },
        );
        expect(result).toBeInstanceOf(Response);
      });

      it('should transform non-streaming response to stream correctly', async () => {
        const mockResponse: OpenAI.ChatCompletion = {
          id: 'chatcmpl-fc539f49-51a8-94be-8061',
          object: 'chat.completion',
          created: 1719901794,
          model: 'qwen-turbo',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'Hello' },
              finish_reason: 'stop',
              logprobs: null,
            },
          ],
        };
        vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
          mockResponse as any,
        );

        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'qwen-turbo',
          temperature: 0.6,
          stream: false,
        });

        const decoder = new TextDecoder();
        const reader = result.body!.getReader();
        const stream: string[] = [];

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          stream.push(decoder.decode(value));
        }

        expect(stream).toEqual([
          'id: chatcmpl-fc539f49-51a8-94be-8061\n',
          'event: text\n',
          'data: "Hello"\n\n',
          'id: chatcmpl-fc539f49-51a8-94be-8061\n',
          'event: stop\n',
          'data: "stop"\n\n',
        ]);

        expect((await reader.read()).done).toBe(true);
      });
    });

    describe('Error', () => {
      it('should return QwenBizError with an openai error response when OpenAI.APIError is thrown', async () => {
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
            model: 'qwen-turbo',
            temperature: 0.999,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: {
              error: { message: 'Bad Request' },
              status: 400,
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should throw AgentRuntimeError with InvalidQwenAPIKey if no apiKey is provided', async () => {
        try {
          new LobeQwenAI({});
        } catch (e) {
          expect(e).toEqual({ errorType: invalidErrorType });
        }
      });

      it('should return QwenBizError with the cause when OpenAI.APIError is thrown with cause', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
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
            model: 'qwen-turbo',
            temperature: 0.999,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should return QwenBizError with an cause response with desensitize Url', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
          cause: { message: 'api is undefined' },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        instance = new LobeQwenAI({
          apiKey: 'test',
          baseURL: defaultBaseURL,
        });

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'qwen-turbo',
            temperature: 0.999,
          });
        } catch (e) {
          expect(e).toEqual({
            /* Desensitizing is unnecessary for a public-accessible gateway endpoint. */
            endpoint: defaultBaseURL,
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should throw an InvalidQwenAPIKey error type on 401 status code', async () => {
        // Mock the API call to simulate a 401 error
        const error = new Error('InvalidApiKey') as any;
        error.status = 401;
        vi.mocked(instance['client'].chat.completions.create).mockRejectedValue(error);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'qwen-turbo',
            temperature: 0.999,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: new Error('InvalidApiKey'),
            errorType: invalidErrorType,
            provider,
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
            model: 'qwen-turbo',
            temperature: 0.999,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            errorType: 'AgentRuntimeError',
            provider,
            error: {
              name: genericError.name,
              cause: genericError.cause,
              message: genericError.message,
              stack: genericError.stack,
            },
          });
        }
      });
    });

    describe('DEBUG', () => {
      it('should call debugStream and return StreamingTextResponse when DEBUG_QWEN_CHAT_COMPLETION is 1', async () => {
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
        const originalDebugValue = process.env.DEBUG_QWEN_CHAT_COMPLETION;

        // 模拟环境变量
        process.env.DEBUG_QWEN_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // 执行测试
        // 运行你的测试函数，确保它会在条件满足时调用 debugStream
        // 假设的测试函数调用，你可能需要根据实际情况调整
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'qwen-turbo',
          stream: true,
          temperature: 0.999,
        });

        // 验证 debugStream 被调用
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // 恢复原始环境变量值
        process.env.DEBUG_QWEN_CHAT_COMPLETION = originalDebugValue;
      });
    });
  });
});
