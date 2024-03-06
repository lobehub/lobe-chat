// @vitest-environment edge-runtime
import { GenerateContentRequest, GenerateContentStreamResult, Part } from '@google/generative-ai';
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatStreamCallbacks, OpenAIChatMessage } from '@/libs/agent-runtime';

import * as debugStreamModule from '../utils/debugStream';
import { LobeGoogleAI } from './index';

const provider = 'google';
const defaultBaseURL = 'https://api.moonshot.cn/v1';
const bizErrorType = 'GoogleBizError';
const invalidErrorType = 'InvalidGoogleAPIKey';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeGoogleAI;

beforeEach(() => {
  instance = new LobeGoogleAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
    generateContentStream: vi.fn().mockResolvedValue(new ReadableStream()),
  } as any);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeGoogleAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeGoogleAI({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeGoogleAI);

      // expect(instance.baseURL).toEqual(defaultBaseURL);
    });
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });
    it('should handle text messages correctly', async () => {
      // 模拟 Google AI SDK 的 generateContentStream 方法返回一个成功的响应流
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      });
      vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
        generateContentStream: vi.fn().mockResolvedValueOnce(mockStream),
      } as any);

      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      expect(result).toBeInstanceOf(Response);
      // 额外的断言可以加入，比如验证返回的流内容等
    });

    it('should call debugStream in DEBUG mode', async () => {
      // 设置环境变量以启用DEBUG模式
      process.env.DEBUG_GOOGLE_CHAT_COMPLETION = '1';

      // 模拟 Google AI SDK 的 generateContentStream 方法返回一个成功的响应流
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Debug mode test');
          controller.close();
        },
      });
      vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
        generateContentStream: vi.fn().mockResolvedValueOnce(mockStream),
      } as any);
      const debugStreamSpy = vi
        .spyOn(debugStreamModule, 'debugStream')
        .mockImplementation(() => Promise.resolve());

      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      expect(debugStreamSpy).toHaveBeenCalled();

      // 清理环境变量
      delete process.env.DEBUG_GOOGLE_CHAT_COMPLETION;
    });

    describe('Error', () => {
      it('should throw InvalidGoogleAPIKey error on API_KEY_INVALID error', async () => {
        // 模拟 Google AI SDK 抛出异常
        const message = `[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1/models/gemini-pro:streamGenerateContent?alt=sse: [400 Bad Request] API key not valid. Please pass a valid API key. [{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"API_KEY_INVALID","domain":"googleapis.com","metadata":{"service":"generativelanguage.googleapis.com"}}]`;

        const apiError = new Error(message);

        vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
          generateContentStream: vi.fn().mockRejectedValue(apiError),
        } as any);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({ errorType: invalidErrorType, error: { message }, provider });
        }
      });

      it('should throw LocationNotSupportError error on location not support error', async () => {
        // 模拟 Google AI SDK 抛出异常
        const message = `[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1/models/gemini-pro:streamGenerateContent?alt=sse: [400 Bad Request] User location is not supported for the API use.`;

        const apiError = new Error(message);

        vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
          generateContentStream: vi.fn().mockRejectedValue(apiError),
        } as any);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({ errorType: 'LocationNotSupportError', error: { message }, provider });
        }
      });

      it('should throw BizError error', async () => {
        // 模拟 Google AI SDK 抛出异常
        const message = `[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1/models/gemini-pro:streamGenerateContent?alt=sse: [400 Bad Request] API key not valid. Please pass a valid API key. [{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"Error","domain":"googleapis.com","metadata":{"service":"generativelanguage.googleapis.com"}}]`;

        const apiError = new Error(message);

        vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
          generateContentStream: vi.fn().mockRejectedValue(apiError),
        } as any);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            errorType: bizErrorType,
            error: [
              {
                '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
                'domain': 'googleapis.com',
                'metadata': {
                  service: 'generativelanguage.googleapis.com',
                },
                'reason': 'Error',
              },
            ],
            provider,
          });
        }
      });

      it('should throw DefaultError error', async () => {
        // 模拟 Google AI SDK 抛出异常
        const message = `[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1/models/gemini-pro:streamGenerateContent?alt=sse: [400 Bad Request] API key not valid. Please pass a valid API key. [{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"Error","domain":"googleapis.com","metadata":{"service":"generativelanguage.googleapis.com}}]`;

        const apiError = new Error(message);

        vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
          generateContentStream: vi.fn().mockRejectedValue(apiError),
        } as any);

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            errorType: bizErrorType,
            error: {
              message: `[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1/models/gemini-pro:streamGenerateContent?alt=sse: [400 Bad Request] API key not valid. Please pass a valid API key. [{"@type":"type.googleapis.com/google.rpc.ErrorInfo","reason":"Error","domain":"googleapis.com","metadata":{"service":"generativelanguage.googleapis.com}}]`,
            },
            provider,
          });
        }
      });

      it('should return GoogleBizError with an openai error response when APIError is thrown', async () => {
        // Arrange
        const apiError = new Error('Error message');

        // 使用 vi.spyOn 来模拟 chat.completions.create 方法
        vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
          generateContentStream: vi.fn().mockRejectedValue(apiError),
        } as any);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            error: { message: 'Error message' },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should throw AgentRuntimeError with NoOpenAIAPIKey if no apiKey is provided', async () => {
        try {
          new LobeGoogleAI({});
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

        vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
          generateContentStream: vi.fn().mockRejectedValue(apiError),
        } as any);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            error: {
              message: `400 {"stack":"abc","cause":{"message":"api is undefined"}}`,
            },
            errorType: bizErrorType,
            provider,
          });
        }
      });

      it('should return AgentRuntimeError for non-OpenAI errors', async () => {
        // Arrange
        const genericError = new Error('Generic Error');

        vi.spyOn(instance['client'], 'getGenerativeModel').mockReturnValue({
          generateContentStream: vi.fn().mockRejectedValue(genericError),
        } as any);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            errorType: 'GoogleBizError',
            provider,
            error: {
              message: 'Generic Error',
            },
          });
        }
      });
    });
  });

  describe('private method', () => {
    describe('convertContentToGooglePart', () => {
      it('should throw TypeError when image URL does not contain base64 data', () => {
        // 提供一个不包含base64数据的图像URL
        const invalidImageUrl = 'http://example.com/image.png';

        expect(() =>
          instance['convertContentToGooglePart']({
            type: 'image_url',
            image_url: { url: invalidImageUrl },
          }),
        ).toThrow(TypeError);
      });
    });

    describe('buildGoogleMessages', () => {
      it('should use default text model when no images are included in messages', () => {
        const messages: OpenAIChatMessage[] = [
          { content: 'Hello', role: 'user' },
          { content: 'Hi', role: 'assistant' },
        ];
        const model = 'text-davinci-003';

        // 调用 buildGoogleMessages 方法
        const { contents, model: usedModel } = instance['buildGoogleMessages'](messages, model);

        expect(usedModel).toEqual('gemini-pro'); // 假设 'gemini-pro' 是默认文本模型
        expect(contents).toHaveLength(2);
        expect(contents).toEqual([
          { parts: [{ text: 'Hello' }], role: 'user' },
          { parts: [{ text: 'Hi' }], role: 'model' },
        ]);
      });

      it('should use specified model when images are included in messages', () => {
        const messages: OpenAIChatMessage[] = [
          {
            content: [
              { type: 'text', text: 'Hello' },
              { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
            ],
            role: 'user',
          },
        ];
        const model = 'gemini-pro-vision';

        // 调用 buildGoogleMessages 方法
        const { contents, model: usedModel } = instance['buildGoogleMessages'](messages, model);

        expect(usedModel).toEqual(model);
        expect(contents).toHaveLength(1);
        expect(contents).toEqual([
          {
            parts: [{ text: 'Hello' }, { inlineData: { data: '...', mimeType: 'image/png' } }],
            role: 'user',
          },
        ]);
      });
    });
  });
});
