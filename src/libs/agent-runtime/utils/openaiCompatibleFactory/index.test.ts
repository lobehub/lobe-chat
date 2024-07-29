// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  AgentRuntimeErrorType,
  ChatStreamCallbacks,
  LobeOpenAICompatibleRuntime,
  ModelProvider,
} from '@/libs/agent-runtime';

import * as debugStreamModule from '../debugStream';
import { LobeOpenAICompatibleFactory } from './index';

const provider = 'groq';
const defaultBaseURL = 'https://api.groq.com/openai/v1';
const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

const LobeMockProvider = LobeOpenAICompatibleFactory({
  baseURL: defaultBaseURL,
  chatCompletion: {
    handleError: (error) => {
      // 403 means the location is not supporteds
      if (error.status === 403)
        return { error, errorType: AgentRuntimeErrorType.LocationNotSupportError };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_MOCKPROVIDER_CHAT_COMPLETION === '1',
  },
  provider: ModelProvider.Groq,
});

beforeEach(() => {
  instance = new LobeMockProvider({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeOpenAICompatibleFactory', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeMockProvider({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeMockProvider);
      expect(instance.baseURL).toEqual(defaultBaseURL);
    });
  });

  describe('chat', () => {
    it('should return a Response on successful API call', async () => {
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

    it('should call chat API with corresponding options', async () => {
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
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'mistralai/mistral-7b-instruct:free',
          temperature: 0.7,
          stream: true,
          top_p: 1,
        },
        { headers: { Accept: '*/*' } },
      );
      expect(result).toBeInstanceOf(Response);
    });

    describe('streaming response', () => {
      it('should handle multiple data chunks correctly', async () => {
        const mockStream = new ReadableStream({
          start(controller) {
            controller.enqueue({
              id: 'a',
              object: 'chat.completion.chunk',
              created: 1709125675,
              model: 'mistralai/mistral-7b-instruct:free',
              system_fingerprint: 'fp_86156a94a0',
              choices: [
                { index: 0, delta: { content: 'hello' }, logprobs: null, finish_reason: null },
              ],
            });
            controller.close();
          },
        });
        vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
          mockStream as any,
        );

        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'mistralai/mistral-7b-instruct:free',
          temperature: 0,
        });

        const decoder = new TextDecoder();
        const reader = result.body!.getReader();
        expect(decoder.decode((await reader.read()).value)).toEqual('id: a\n');
        expect(decoder.decode((await reader.read()).value)).toEqual('event: text\n');
        expect(decoder.decode((await reader.read()).value)).toEqual('data: "hello"\n\n');
        expect((await reader.read()).done).toBe(true);
      });

      // https://github.com/lobehub/lobe-chat/issues/2752
      it('should handle burn hair data chunks correctly', async () => {
        const chunks = [
          {
            choices: [],
            created: 0,
            id: '',
            model: '',
            object: '',
            prompt_filter_results: [
              {
                prompt_index: 0,
                content_filter_results: {
                  hate: { filtered: false, severity: 'safe' },
                  self_harm: { filtered: false, severity: 'safe' },
                  sexual: { filtered: false, severity: 'safe' },
                  violence: { filtered: false, severity: 'safe' },
                },
              },
            ],
          },
          {
            choices: [
              {
                delta: { content: '', role: 'assistant' },
                finish_reason: null,
                index: 0,
                logprobs: null,
              },
            ],
            created: 1717249403,
            id: 'chatcmpl-9VJIxA3qNM2C2YdAnNYA2KgDYfFnX',
            model: 'gpt-4o-2024-05-13',
            object: 'chat.completion.chunk',
            system_fingerprint: 'fp_5f4bad809a',
          },
          {
            choices: [{ delta: { content: '1' }, finish_reason: null, index: 0, logprobs: null }],
            created: 1717249403,
            id: 'chatcmpl-9VJIxA3qNM2C2YdAnNYA2KgDYfFnX',
            model: 'gpt-4o-2024-05-13',
            object: 'chat.completion.chunk',
            system_fingerprint: 'fp_5f4bad809a',
          },
          {
            choices: [{ delta: {}, finish_reason: 'stop', index: 0, logprobs: null }],
            created: 1717249403,
            id: 'chatcmpl-9VJIxA3qNM2C2YdAnNYA2KgDYfFnX',
            model: 'gpt-4o-2024-05-13',
            object: 'chat.completion.chunk',
            system_fingerprint: 'fp_5f4bad809a',
          },
          {
            choices: [
              {
                content_filter_offsets: { check_offset: 35, start_offset: 35, end_offset: 36 },
                content_filter_results: {
                  hate: { filtered: false, severity: 'safe' },
                  self_harm: { filtered: false, severity: 'safe' },
                  sexual: { filtered: false, severity: 'safe' },
                  violence: { filtered: false, severity: 'safe' },
                },
                finish_reason: null,
                index: 0,
              },
            ],
            created: 0,
            id: '',
            model: '',
            object: '',
          },
        ];
        const mockStream = new ReadableStream({
          start(controller) {
            chunks.forEach((item) => {
              controller.enqueue(item);
            });

            controller.close();
          },
        });
        vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
          mockStream as any,
        );

        const stream: string[] = [];
        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-3.5-turbo',
          temperature: 0,
        });
        const decoder = new TextDecoder();
        const reader = result.body!.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          stream.push(decoder.decode(value));
        }

        expect(stream).toEqual(
          [
            'id: ',
            'event: data',
            'data: {"choices":[],"created":0,"id":"","model":"","object":"","prompt_filter_results":[{"prompt_index":0,"content_filter_results":{"hate":{"filtered":false,"severity":"safe"},"self_harm":{"filtered":false,"severity":"safe"},"sexual":{"filtered":false,"severity":"safe"},"violence":{"filtered":false,"severity":"safe"}}}]}\n',
            'id: chatcmpl-9VJIxA3qNM2C2YdAnNYA2KgDYfFnX',
            'event: text',
            'data: ""\n',
            'id: chatcmpl-9VJIxA3qNM2C2YdAnNYA2KgDYfFnX',
            'event: text',
            'data: "1"\n',
            'id: chatcmpl-9VJIxA3qNM2C2YdAnNYA2KgDYfFnX',
            'event: stop',
            'data: "stop"\n',
            'id: ',
            'event: data',
            'data: {"id":"","index":0}\n',
          ].map((item) => `${item}\n`),
        );
      });

      it.skip('should handle anthropic sonnet 3.5 tool calling chunks correctly', async () => {
        const chunks = [
          {
            id: 'chatcmpl-b3f58dc5-0699-4b28-aefe-6624c2a68d51',
            created: 1718909418,
            model: 'claude-3-5-sonnet-20240620',
            object: 'chat.completion.chunk',

            choices: [
              {
                index: 0,
                delta: {
                  content:
                    '好的,我可以帮您查询杭州的天气情况。让我使用实时天气工具来获取杭州的当前天气信息。',
                  id: 'rolu_01JXyRw6Ti78mR2dn6U5h1pa',
                  function: {
                    arguments: '{"city": "杭州"}',
                    name: 'realtime-weather____fetchCurrentWeather',
                  },
                  type: 'function',
                  index: 0,
                },
              },
            ],
          },
          {
            id: 'chatcmpl-b3f58dc5-0699-4b28-aefe-6624c2a68d51',
            choices: [{ finish_reason: 'stop', index: 0, delta: {} }],
            created: 1718909418,
            model: 'claude-3-5-sonnet-20240620',
            object: 'chat.completion.chunk',
          },
        ];
        const mockStream = new ReadableStream({
          start(controller) {
            chunks.forEach((item) => {
              controller.enqueue(item);
            });

            controller.close();
          },
        });
        vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
          mockStream as any,
        );

        const stream: string[] = [];
        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'gpt-3.5-turbo',
          temperature: 0,
        });
        const decoder = new TextDecoder();
        const reader = result.body!.getReader();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          stream.push(decoder.decode(value));
        }

        expect(stream).toEqual(
          [
            'id: chatcmpl-b3f58dc5-0699-4b28-aefe-6624c2a68d51',
            'event: text',
            'data: "好的,我可以帮您查询杭州的天气情况。让我使用实时天气工具来获取杭州的当前天气信息。"\n',
            'id: chatcmpl-b3f58dc5-0699-4b28-aefe-6624c2a68d51',
            'event: tool_calls',
            'data: ""\n',
            'id: chatcmpl-b3f58dc5-0699-4b28-aefe-6624c2a68d51',
            'event: stop',
            'data: "stop"\n',
          ].map((item) => `${item}\n`),
        );
      });

      it('should transform non-streaming response to stream correctly', async () => {
        const mockResponse: OpenAI.ChatCompletion = {
          id: 'a',
          object: 'chat.completion',
          created: 123,
          model: 'mistralai/mistral-7b-instruct:free',
          choices: [
            {
              index: 0,
              message: { role: 'assistant', content: 'Hello' },
              finish_reason: 'stop',
              logprobs: null,
            },
          ],
          usage: {
            prompt_tokens: 5,
            completion_tokens: 5,
            total_tokens: 10,
          },
        };
        vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
          mockResponse as any,
        );

        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'mistralai/mistral-7b-instruct:free',
          temperature: 0,
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
          'id: a\n',
          'event: text\n',
          'data: "Hello"\n\n',
          'id: a\n',
          'event: stop\n',
          'data: "stop"\n\n',
        ]);

        expect((await reader.read()).done).toBe(true);
      });
    });

    describe('handlePayload option', () => {
      it('should add user in payload correctly', async () => {
        const mockCreateMethod = vi.spyOn(instance['client'].chat.completions, 'create');

        await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
          },
          { user: 'abc' },
        );

        expect(mockCreateMethod).toHaveBeenCalledWith(
          expect.objectContaining({
            user: 'abc',
          }),
          expect.anything(),
        );
      });
    });

    describe('cancel request', () => {
      it('should cancel ongoing request correctly', async () => {
        const controller = new AbortController();
        const mockCreateMethod = vi.spyOn(instance['client'].chat.completions, 'create');

        instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
          },
          { signal: controller.signal },
        );

        controller.abort();

        expect(mockCreateMethod).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            signal: controller.signal,
          }),
        );
      });
    });

    describe('Error', () => {
      it('should return bizErrorType with an openai error response when OpenAI.APIError is thrown', async () => {
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

      it('should throw AgentRuntimeError with invalidErrorType if no apiKey is provided', async () => {
        try {
          new LobeMockProvider({});
        } catch (e) {
          expect(e).toEqual({ errorType: invalidErrorType });
        }
      });

      it('should return bizErrorType with the cause when OpenAI.APIError is thrown with cause', async () => {
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

      it('should return bizErrorType with an cause response with desensitize Url', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
          cause: { message: 'api is undefined' },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        instance = new LobeMockProvider({
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

      describe('handleError option', () => {
        it('should return correct error type for 403 status code', async () => {
          const error = { status: 403 };
          vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(error);

          try {
            await instance.chat({
              messages: [{ content: 'Hello', role: 'user' }],
              model: 'mistralai/mistral-7b-instruct:free',
              temperature: 0,
            });
          } catch (e) {
            expect(e).toEqual({
              error,
              errorType: AgentRuntimeErrorType.LocationNotSupportError,
              provider,
            });
          }
        });
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

    describe('chat with callback and headers', () => {
      it('should handle callback and headers correctly', async () => {
        // 模拟 chat.completions.create 方法返回一个可读流
        const mockCreateMethod = vi
          .spyOn(instance['client'].chat.completions, 'create')
          .mockResolvedValue(
            new ReadableStream({
              start(controller) {
                controller.enqueue({
                  id: 'chatcmpl-8xDx5AETP8mESQN7UB30GxTN2H1SO',
                  object: 'chat.completion.chunk',
                  created: 1709125675,
                  model: 'mistralai/mistral-7b-instruct:free',
                  system_fingerprint: 'fp_86156a94a0',
                  choices: [
                    { index: 0, delta: { content: 'hello' }, logprobs: null, finish_reason: null },
                  ],
                });
                controller.close();
              },
            }) as any,
          );

        // 准备 callback 和 headers
        const mockCallback: ChatStreamCallbacks = {
          onStart: vi.fn(),
          onToken: vi.fn(),
        };
        const mockHeaders = { 'Custom-Header': 'TestValue' };

        // 执行测试
        const result = await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
          },
          { callback: mockCallback, headers: mockHeaders },
        );

        // 验证 callback 被调用
        await result.text(); // 确保流被消费
        expect(mockCallback.onStart).toHaveBeenCalled();
        expect(mockCallback.onToken).toHaveBeenCalledWith('hello');

        // 验证 headers 被正确传递
        expect(result.headers.get('Custom-Header')).toEqual('TestValue');

        // 清理
        mockCreateMethod.mockRestore();
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
        const originalDebugValue = process.env.DEBUG_MOCKPROVIDER_CHAT_COMPLETION;

        // 模拟环境变量
        process.env.DEBUG_MOCKPROVIDER_CHAT_COMPLETION = '1';
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
        process.env.DEBUG_MOCKPROVIDER_CHAT_COMPLETION = originalDebugValue;
      });
    });
  });
});
