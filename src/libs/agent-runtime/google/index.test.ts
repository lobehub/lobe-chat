// @vitest-environment edge-runtime
import { FunctionDeclarationsTool } from '@google/generative-ai';
import OpenAI from 'openai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OpenAIChatMessage } from '@/libs/agent-runtime';
import * as imageToBase64Module from '@/utils/imageToBase64';

import * as debugStreamModule from '../utils/debugStream';
import { LobeGoogleAI } from './index';

const provider = 'google';
const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';

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
            errorType: bizErrorType,
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
      it('should handle text type messages', async () => {
        const result = await instance['convertContentToGooglePart']({
          type: 'text',
          text: 'Hello',
        });
        expect(result).toEqual({ text: 'Hello' });
      });

      it('should handle base64 type images', async () => {
        const base64Image =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
        const result = await instance['convertContentToGooglePart']({
          type: 'image_url',
          image_url: { url: base64Image },
        });

        expect(result).toEqual({
          inlineData: {
            data: 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
            mimeType: 'image/png',
          },
        });
      });

      it('should handle URL type images', async () => {
        const imageUrl = 'http://example.com/image.png';
        const mockBase64 = 'mockBase64Data';

        // Mock the imageUrlToBase64 function
        vi.spyOn(imageToBase64Module, 'imageUrlToBase64').mockResolvedValueOnce({
          base64: mockBase64,
          mimeType: 'image/png',
        });

        const result = await instance['convertContentToGooglePart']({
          type: 'image_url',
          image_url: { url: imageUrl },
        });

        expect(result).toEqual({
          inlineData: {
            data: mockBase64,
            mimeType: 'image/png',
          },
        });

        expect(imageToBase64Module.imageUrlToBase64).toHaveBeenCalledWith(imageUrl);
      });

      it('should throw TypeError for unsupported image URL types', async () => {
        const unsupportedImageUrl = 'unsupported://example.com/image.png';

        await expect(
          instance['convertContentToGooglePart']({
            type: 'image_url',
            image_url: { url: unsupportedImageUrl },
          }),
        ).rejects.toThrow(TypeError);
      });
    });

    describe('buildGoogleMessages', () => {
      it('get default result with gemini-pro', async () => {
        const messages: OpenAIChatMessage[] = [{ content: 'Hello', role: 'user' }];

        const contents = await instance['buildGoogleMessages'](messages, 'gemini-pro');

        expect(contents).toHaveLength(1);
        expect(contents).toEqual([{ parts: [{ text: 'Hello' }], role: 'user' }]);
      });

      it('messages should end with user if using gemini-pro', async () => {
        const messages: OpenAIChatMessage[] = [
          { content: 'Hello', role: 'user' },
          { content: 'Hi', role: 'assistant' },
        ];

        const contents = await instance['buildGoogleMessages'](messages, 'gemini-1.0');

        expect(contents).toHaveLength(3);
        expect(contents).toEqual([
          { parts: [{ text: 'Hello' }], role: 'user' },
          { parts: [{ text: 'Hi' }], role: 'model' },
          { parts: [{ text: '' }], role: 'user' },
        ]);
      });

      it('should include system role if there is a system role prompt', async () => {
        const messages: OpenAIChatMessage[] = [
          { content: 'you are ChatGPT', role: 'system' },
          { content: 'Who are you', role: 'user' },
        ];

        const contents = await instance['buildGoogleMessages'](messages, 'gemini-1.0');

        expect(contents).toHaveLength(3);
        expect(contents).toEqual([
          { parts: [{ text: 'you are ChatGPT' }], role: 'user' },
          { parts: [{ text: '' }], role: 'model' },
          { parts: [{ text: 'Who are you' }], role: 'user' },
        ]);
      });

      it('should not modify the length if model is gemini-1.5-pro', async () => {
        const messages: OpenAIChatMessage[] = [
          { content: 'Hello', role: 'user' },
          { content: 'Hi', role: 'assistant' },
        ];

        const contents = await instance['buildGoogleMessages'](messages, 'gemini-1.5-pro-latest');

        expect(contents).toHaveLength(2);
        expect(contents).toEqual([
          { parts: [{ text: 'Hello' }], role: 'user' },
          { parts: [{ text: 'Hi' }], role: 'model' },
        ]);
      });

      it('should use specified model when images are included in messages', async () => {
        const messages: OpenAIChatMessage[] = [
          {
            content: [
              { type: 'text', text: 'Hello' },
              { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
            ],
            role: 'user',
          },
        ];
        const model = 'gemini-1.5-flash-latest';

        // 调用 buildGoogleMessages 方法
        const contents = await instance['buildGoogleMessages'](messages, model);

        expect(contents).toHaveLength(1);
        expect(contents).toEqual([
          {
            parts: [{ text: 'Hello' }, { inlineData: { data: '...', mimeType: 'image/png' } }],
            role: 'user',
          },
        ]);
      });
    });

    describe('buildGoogleTools', () => {
      it('should return undefined when tools is undefined or empty', () => {
        expect(instance['buildGoogleTools'](undefined)).toBeUndefined();
        expect(instance['buildGoogleTools']([])).toBeUndefined();
      });

      it('should correctly convert ChatCompletionTool to GoogleFunctionCallTool', () => {
        const tools: OpenAI.ChatCompletionTool[] = [
          {
            function: {
              name: 'testTool',
              description: 'A test tool',
              parameters: {
                type: 'object',
                properties: {
                  param1: { type: 'string' },
                  param2: { type: 'number' },
                },
                required: ['param1'],
              },
            },
            type: 'function',
          },
        ];

        const googleTools = instance['buildGoogleTools'](tools);

        expect(googleTools).toHaveLength(1);
        expect((googleTools![0] as FunctionDeclarationsTool).functionDeclarations![0]).toEqual({
          name: 'testTool',
          description: 'A test tool',
          parameters: {
            type: 'object',
            properties: {
              param1: { type: 'string' },
              param2: { type: 'number' },
            },
            required: ['param1'],
          },
        });
      });
    });

    describe('convertOAIMessagesToGoogleMessage', () => {
      it('should correctly convert assistant message', async () => {
        const message: OpenAIChatMessage = {
          role: 'assistant',
          content: 'Hello',
        };

        const converted = await instance['convertOAIMessagesToGoogleMessage'](message);

        expect(converted).toEqual({
          role: 'model',
          parts: [{ text: 'Hello' }],
        });
      });

      it('should correctly convert user message', async () => {
        const message: OpenAIChatMessage = {
          role: 'user',
          content: 'Hi',
        };

        const converted = await instance['convertOAIMessagesToGoogleMessage'](message);

        expect(converted).toEqual({
          role: 'user',
          parts: [{ text: 'Hi' }],
        });
      });

      it('should correctly convert message with inline base64 image parts', async () => {
        const message: OpenAIChatMessage = {
          role: 'user',
          content: [
            { type: 'text', text: 'Check this image:' },
            { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
          ],
        };

        const converted = await instance['convertOAIMessagesToGoogleMessage'](message);

        expect(converted).toEqual({
          role: 'user',
          parts: [
            { text: 'Check this image:' },
            { inlineData: { data: '...', mimeType: 'image/png' } },
          ],
        });
      });
      it.skip('should correctly convert message with image url parts', async () => {
        const message: OpenAIChatMessage = {
          role: 'user',
          content: [
            { type: 'text', text: 'Check this image:' },
            { type: 'image_url', image_url: { url: 'https://image-file.com' } },
          ],
        };

        const converted = await instance['convertOAIMessagesToGoogleMessage'](message);

        expect(converted).toEqual({
          role: 'user',
          parts: [
            { text: 'Check this image:' },
            { inlineData: { data: '...', mimeType: 'image/png' } },
          ],
        });
      });

      it('should correctly convert function call message', async () => {
        const message = {
          role: 'assistant',
          tool_calls: [
            {
              id: 'call_1',
              function: {
                name: 'get_current_weather',
                arguments: JSON.stringify({ location: 'London', unit: 'celsius' }),
              },
              type: 'function',
            },
          ],
        } as OpenAIChatMessage;

        const converted = await instance['convertOAIMessagesToGoogleMessage'](message);
        expect(converted).toEqual({
          role: 'function',
          parts: [
            {
              functionCall: {
                name: 'get_current_weather',
                args: { location: 'London', unit: 'celsius' },
              },
            },
          ],
        });
      });

      it('should correctly handle empty content', async () => {
        const message: OpenAIChatMessage = {
          role: 'user',
          content: '' as any, // explicitly set as empty string
        };

        const converted = await instance['convertOAIMessagesToGoogleMessage'](message);

        expect(converted).toEqual({
          role: 'user',
          parts: [{ text: '' }],
        });
      });
    });
  });
});
