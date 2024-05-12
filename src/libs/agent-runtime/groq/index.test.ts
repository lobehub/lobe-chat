// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatStreamCallbacks, LobeOpenAICompatibleRuntime } from '@/libs/agent-runtime';

import * as debugStreamModule from '../utils/debugStream';
import { LobeGroq } from './index';

const provider = 'groq';
const defaultBaseURL = 'https://api.groq.com/openai/v1';
const bizErrorType = 'GroqBizError';
const invalidErrorType = 'InvalidGroqAPIKey';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeGroq({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeGroqAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeGroq({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeGroq);
      expect(instance.baseURL).toEqual(defaultBaseURL);
    });
  });

  describe('chat', () => {
    it('should call chat with corresponding options', async () => {
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
        {
          max_tokens: 1024,
          stream: true,
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'mistralai/mistral-7b-instruct:free',
          temperature: 0.7,
          top_p: 1,
        },
        { headers: { Accept: '*/*' } },
      );
      expect(result).toBeInstanceOf(Response);
    });

    describe('handlePayload option', () => {
      it('should set stream to false when payload contains tools', async () => {
        const mockCreateMethod = vi
          .spyOn(instance['client'].chat.completions, 'create')
          .mockResolvedValue({
            id: 'chatcmpl-8xDx5AETP8mESQN7UB30GxTN2H1SO',
            object: 'chat.completion',
            created: 1709125675,
            model: 'mistralai/mistral-7b-instruct:free',
            system_fingerprint: 'fp_86156a94a0',
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: 'hello' },
                logprobs: null,
                finish_reason: 'stop',
              },
            ],
          });

        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'mistralai/mistral-7b-instruct:free',
          temperature: 0,
          tools: [
            {
              type: 'function',
              function: { name: 'tool1', description: '', parameters: {} },
            },
          ],
        });

        expect(mockCreateMethod).toHaveBeenCalledWith(
          expect.objectContaining({ stream: false }),
          expect.anything(),
        );
      });
    });

    describe('Error', () => {
      it('should return OpenRouterBizError with an openai error response when OpenAI.APIError is thrown', async () => {
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
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
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

      it('should throw AgentRuntimeError with InvalidOpenRouterAPIKey if no apiKey is provided', async () => {
        try {
          new LobeGroq({});
        } catch (e) {
          expect(e).toEqual({ errorType: invalidErrorType });
        }
      });

      it('should return OpenRouterBizError with the cause when OpenAI.APIError is thrown with cause', async () => {
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
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
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

      it('should return OpenRouterBizError with an cause response with desensitize Url', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
          cause: { message: 'api is undefined' },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        instance = new LobeGroq({
          apiKey: 'test',

          baseURL: 'https://api.abc.com/v1',
        });

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.***.com/v1',
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should throw an InvalidOpenRouterAPIKey error type on 401 status code', async () => {
        // Mock the API call to simulate a 401 error
        const error = new Error('Unauthorized') as any;
        error.status = 401;
        vi.mocked(instance['client'].chat.completions.create).mockRejectedValue(error);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
          });
        } catch (e) {
          // Expect the chat method to throw an error with InvalidMoonshotAPIKey
          expect(e).toEqual({
            endpoint: defaultBaseURL,
            error: new Error('Unauthorized'),
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
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
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
      it('should call debugStream and return StreamingTextResponse when DEBUG_OPENROUTER_CHAT_COMPLETION is 1', async () => {
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
        const originalDebugValue = process.env.DEBUG_GROQ_CHAT_COMPLETION;

        // 模拟环境变量
        process.env.DEBUG_GROQ_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // 执行测试
        // 运行你的测试函数，确保它会在条件满足时调用 debugStream
        // 假设的测试函数调用，你可能需要根据实际情况调整
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'mistralai/mistral-7b-instruct:free',
          temperature: 0,
        });

        // 验证 debugStream 被调用
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // 恢复原始环境变量值
        process.env.DEBUG_GROQ_CHAT_COMPLETION = originalDebugValue;
      });
    });
  });
});
