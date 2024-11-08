// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ChatStreamCallbacks,
  LobeOpenAICompatibleRuntime,
  ModelProvider,
} from '@/libs/agent-runtime';

import * as debugStreamModule from '../utils/debugStream';
import { LobeTaichuAI } from './index';

const provider = ModelProvider.Taichu;
const defaultBaseURL = 'https://ai-maas.wair.ac.cn/maas/v1';

const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

beforeEach(() => {
  instance = new LobeTaichuAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeTaichuAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeTaichuAI({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeTaichuAI);
      expect(instance.baseURL).toEqual(defaultBaseURL);
    });
  });

  describe('chat', () => {
    describe('Error', () => {
      it('should return OpenAIBizError with an openai error response when OpenAI.APIError is thrown', async () => {
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
            model: 'Taichu4',
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

      it('should throw AgentRuntimeError with NoOpenAIAPIKey if no apiKey is provided', async () => {
        try {
          new LobeTaichuAI({});
        } catch (e) {
          expect(e).toEqual({ errorType: invalidErrorType });
        }
      });

      it('should return OpenAIBizError with the cause when OpenAI.APIError is thrown with cause', async () => {
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
            model: 'Taichu4',
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

      it('should return OpenAIBizError with an cause response with desensitize Url', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
          cause: { message: 'api is undefined' },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        instance = new LobeTaichuAI({
          apiKey: 'test',

          baseURL: 'https://api.abc.com/v1',
        });

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'Taichu4',
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

      it('should throw an InvalidTaichuAPIKey error type on 401 status code', async () => {
        // Mock the API call to simulate a 401 error
        const error = new Error('Unauthorized') as any;
        error.status = 401;
        vi.mocked(instance['client'].chat.completions.create).mockRejectedValue(error);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'Taichu4',
            temperature: 0,
          });
        } catch (e) {
          // Expect the chat method to throw an error with InvalidTaichuAPIKey
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
            model: 'Taichu4',
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
      it('should call debugStream and return StreamingTextResponse when DEBUG_TAICHU_CHAT_COMPLETION is 1', async () => {
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
        const originalDebugValue = process.env.DEBUG_TAICHU_CHAT_COMPLETION;

        // 模拟环境变量
        process.env.DEBUG_TAICHU_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // 执行测试
        // 运行你的测试函数，确保它会在条件满足时调用 debugStream
        // 假设的测试函数调用，你可能需要根据实际情况调整
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'Taichu4',
          stream: true,
          temperature: 0,
        });

        // 验证 debugStream 被调用
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // 恢复原始环境变量值
        process.env.DEBUG_TAICHU_CHAT_COMPLETION = originalDebugValue;
      });
    });

    it('should correctly adjust temperature and top_p parameters', async () => {
      const instance = new LobeTaichuAI({ apiKey: 'test_api_key' });

      // Mock the chat.completions.create method
      const errorInfo = {
        stack: 'abc',
        cause: {
          message: 'api is undefined',
        },
      };
      const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

      const mockCreate = vi
        .spyOn(instance['client'].chat.completions, 'create')
        .mockRejectedValue(apiError);

      // Test cases for temperature and top_p
      const testCases = [
        { temperature: 0.5, top_p: 0.5, expectedTemperature: 0.25, expectedTopP: 0.25 },
        { temperature: 1.0, top_p: 1.0, expectedTemperature: 0.5, expectedTopP: 0.5 },
        { temperature: 2.0, top_p: 2.0, expectedTemperature: 1.0, expectedTopP: 1.0 },
        { temperature: 1.0, top_p: undefined, expectedTemperature: 0.5, expectedTopP: undefined },
        { temperature: 0, top_p: 0.1, expectedTemperature: 0.01, expectedTopP: 0.1 },
        { temperature: 0.01, top_p: 0.0, expectedTemperature: 0.01, expectedTopP: 0.1 },
        { temperature: 0.02, top_p: 20.0, expectedTemperature: 0.01, expectedTopP: 9.9 },
      ];

      for (const { temperature, top_p, expectedTemperature, expectedTopP } of testCases) {
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'Taichu4',
            temperature,
            top_p,
            stream: true,
          });

          expect(mockCreate).toHaveBeenCalledWith(
            expect.objectContaining({
              temperature: expectedTemperature,
              top_p: expectedTopP,
            }),
            expect.objectContaining({}),
          );
        } catch (e) {}
      }
    });
  });
});
