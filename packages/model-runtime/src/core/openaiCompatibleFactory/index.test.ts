// @vitest-environment node
import {
  AgentRuntimeErrorType,
  ChatStreamCallbacks,
  ChatStreamPayload,
  LobeOpenAICompatibleRuntime,
  ModelProvider,
} from '@lobechat/model-runtime';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as debugStreamModule from '../../utils/debugStream';
import * as openaiHelpers from '../../utils/openaiHelpers';
import { createOpenAICompatibleRuntime } from './index';

const sleep = async (ms: number) =>
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const provider = 'groq';
const defaultBaseURL = 'https://api.groq.com/openai/v1';
const bizErrorType = 'ProviderBizError';
const invalidErrorType = 'InvalidProviderAPIKey';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeOpenAICompatibleRuntime;

const LobeMockProvider = createOpenAICompatibleRuntime({
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

  // Use vi.spyOn to mock the chat.completions.create method
  vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
    new ReadableStream() as any,
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeOpenAICompatibleFactory', () => {
  // Polyfill File for Node environment used in image tests
  if (typeof File === 'undefined') {
    // @ts-ignore
    global.File = class MockFile {
      constructor(public parts: any[], public name: string, public opts?: any) {}
    };
  }

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
          stream_options: {
            include_usage: true,
          },
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

        // Collect all chunks
        const chunks = [];
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          chunks.push(decoder.decode(value));
        }
        // Assert that all expected chunk patterns are present
        expect(chunks).toEqual(
          expect.arrayContaining([
            'id: a\n',
            'event: text\n',
            'data: "hello"\n\n',
          ]),
        );
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
        const mockResponse = {
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
        } as OpenAI.ChatCompletion;
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
          'event: usage\n',
          'data: {"inputTextTokens":5,"outputTextTokens":5,"totalInputTokens":5,"totalOutputTokens":5,"totalTokens":10}\n\n',
          'id: output_speed\n',
          'event: speed\n',
          expect.stringMatching(/^data: \{.*"tps":.*,"ttft":.*}\n\n$/), // tps ttft 测试结果不一样
          'id: a\n',
          'event: stop\n',
          'data: "stop"\n\n',
        ]);

        expect((await reader.read()).done).toBe(true);
      });

      it('should transform non-streaming response to stream correctly with reasoning content', async () => {
        const mockResponse = {
          id: 'a',
          object: 'chat.completion',
          created: 123,
          model: 'deepseek/deepseek-reasoner',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: 'Hello',
                reasoning_content: 'Thinking content',
              },
              finish_reason: 'stop',
              logprobs: null,
            },
          ],
          usage: {
            prompt_tokens: 5,
            completion_tokens: 5,
            total_tokens: 10,
          },
        } as unknown as OpenAI.ChatCompletion;
        vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
          mockResponse as any,
        );

        const result = await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'deepseek/deepseek-reasoner',
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
          'event: reasoning\n',
          'data: "Thinking content"\n\n',
          'id: a\n',
          'event: text\n',
          'data: "Hello"\n\n',
          'id: a\n',
          'event: usage\n',
          'data: {"inputTextTokens":5,"outputTextTokens":5,"totalInputTokens":5,"totalOutputTokens":5,"totalTokens":10}\n\n',
          'id: output_speed\n',
          'event: speed\n',
          expect.stringMatching(/^data: \{.*"tps":.*,"ttft":.*}\n\n$/), // tps ttft 测试结果不一样
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

    describe('noUserId option', () => {
      it('should not add user to payload when noUserId is true', async () => {
        const LobeMockProvider = createOpenAICompatibleRuntime({
          baseURL: 'https://api.mistral.ai/v1',
          chatCompletion: {
            noUserId: true,
          },
          provider: ModelProvider.Mistral,
        });

        const instance = new LobeMockProvider({ apiKey: 'test' });
        const mockCreateMethod = vi
          .spyOn(instance['client'].chat.completions, 'create')
          .mockResolvedValue(new ReadableStream() as any);

        await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'open-mistral-7b',
            temperature: 0,
          },
          { user: 'testUser' },
        );

        expect(mockCreateMethod).toHaveBeenCalledWith(
          expect.not.objectContaining({
            user: 'testUser',
          }),
          expect.anything(),
        );
      });

      it('should add user to payload when noUserId is false', async () => {
        const LobeMockProvider = createOpenAICompatibleRuntime({
          baseURL: 'https://api.mistral.ai/v1',
          chatCompletion: {
            noUserId: false,
          },
          provider: ModelProvider.Mistral,
        });

        const instance = new LobeMockProvider({ apiKey: 'test' });
        const mockCreateMethod = vi
          .spyOn(instance['client'].chat.completions, 'create')
          .mockResolvedValue(new ReadableStream() as any);

        await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'open-mistral-7b',
            temperature: 0,
          },
          { user: 'testUser' },
        );

        expect(mockCreateMethod).toHaveBeenCalledWith(
          expect.objectContaining({
            user: 'testUser',
          }),
          expect.anything(),
        );
      });

      it('should add user to payload when noUserId is not set in chatCompletion', async () => {
        const LobeMockProvider = createOpenAICompatibleRuntime({
          baseURL: 'https://api.mistral.ai/v1',
          provider: ModelProvider.Mistral,
        });

        const instance = new LobeMockProvider({ apiKey: 'test' });
        const mockCreateMethod = vi
          .spyOn(instance['client'].chat.completions, 'create')
          .mockResolvedValue(new ReadableStream() as any);

        await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'open-mistral-7b',
            temperature: 0,
          },
          { user: 'testUser' },
        );

        expect(mockCreateMethod).toHaveBeenCalledWith(
          expect.objectContaining({
            user: 'testUser',
          }),
          expect.anything(),
        );
      });
    });

    describe('cancel request', () => {
      it('should cancel ongoing request correctly', async () => {
        const controller = new AbortController();
        const mockCreateMethod = vi
          .spyOn(instance['client'].chat.completions, 'create')
          .mockImplementation(
            () =>
              new Promise((_, reject) => {
                setTimeout(() => {
                  reject(new DOMException('The user aborted a request.', 'AbortError'));
                }, 100);
              }) as any,
          );

        const chatPromise = instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
          },
          { signal: controller.signal },
        );

        // Give some time for the request to start
        await sleep(50);

        controller.abort();

        // Wait and assert that Promise is rejected
        // Use try-catch to capture and verify errors
        try {
          await chatPromise;
          // If Promise is not rejected, test should fail
          expect.fail('Expected promise to be rejected');
        } catch (error) {
          expect((error as any).errorType).toBe('AgentRuntimeError');
          expect((error as any).error.name).toBe('AbortError');
          expect((error as any).error.message).toBe('The user aborted a request.');
        }
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
          expect(e).toMatchObject({
            endpoint: defaultBaseURL,
            error,
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
        // Mock chat.completions.create method to return a readable stream
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

        // Prepare callback and headers
        const mockCallback: ChatStreamCallbacks = {
          onStart: vi.fn(),
          onCompletion: vi.fn(),
        };
        const mockHeaders = { 'Custom-Header': 'TestValue' };

        // Execute test
        const result = await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'mistralai/mistral-7b-instruct:free',
            temperature: 0,
          },
          { callback: mockCallback, headers: mockHeaders },
        );

        // Verify callback is called
        await result.text(); // Ensure stream is consumed
        expect(mockCallback.onStart).toHaveBeenCalled();
        expect(mockCallback.onCompletion).toHaveBeenCalledWith({
          text: 'hello',
        });

        // Verify headers are correctly passed
        expect(result.headers.get('Custom-Header')).toEqual('TestValue');

        // Cleanup
        mockCreateMethod.mockRestore();
      });
    });

    it('should use custom stream handler when provided', async () => {
      // Create a custom stream handler that handles both ReadableStream and OpenAI Stream
      const customStreamHandler = vi.fn(
        (stream: ReadableStream | Stream<OpenAI.ChatCompletionChunk>) => {
          const readableStream =
            stream instanceof ReadableStream ? stream : stream.toReadableStream();
          return new ReadableStream({
            start(controller) {
              const reader = readableStream.getReader();
              const process = async () => {
                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    controller.enqueue(value);
                  }
                } finally {
                  controller.close();
                }
              };
              process();
            },
          });
        },
      );

      const LobeMockProvider = createOpenAICompatibleRuntime({
        baseURL: 'https://api.test.com/v1',
        chatCompletion: {
          handleStream: customStreamHandler,
        },
        provider: ModelProvider.OpenAI,
      });

      const instance = new LobeMockProvider({ apiKey: 'test' });

      // Create a mock stream
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue({
            id: 'test-id',
            choices: [{ delta: { content: 'Hello' }, index: 0 }],
            created: Date.now(),
            model: 'test-model',
            object: 'chat.completion.chunk',
          });
          controller.close();
        },
      });

      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue({
        tee: () => [mockStream, mockStream],
      } as any);

      const payload: ChatStreamPayload = {
        messages: [{ content: 'Test', role: 'user' }],
        model: 'test-model',
        temperature: 0.7,
      };

      await instance.chat(payload);

      expect(customStreamHandler).toHaveBeenCalled();
    });

    it('should use custom transform handler for non-streaming response', async () => {
      const customTransformHandler = vi.fn((data: OpenAI.ChatCompletion): ReadableStream => {
        return new ReadableStream({
          start(controller) {
            // Transform the completion to chunk format
            controller.enqueue({
              id: data.id,
              choices: data.choices.map((choice) => ({
                delta: { content: choice.message.content },
                index: choice.index,
              })),
              created: data.created,
              model: data.model,
              object: 'chat.completion.chunk',
            });
            controller.close();
          },
        });
      });

      const LobeMockProvider = createOpenAICompatibleRuntime({
        baseURL: 'https://api.test.com/v1',
        chatCompletion: {
          handleTransformResponseToStream: customTransformHandler,
        },
        provider: ModelProvider.OpenAI,
      });

      const instance = new LobeMockProvider({ apiKey: 'test' });

      const mockResponse: OpenAI.ChatCompletion = {
        id: 'test-id',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Test response',
              refusal: null,
            },
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
        created: Date.now(),
        model: 'test-model',
        object: 'chat.completion',
        usage: { completion_tokens: 2, prompt_tokens: 1, total_tokens: 3 },
      };

      vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
        mockResponse as any,
      );

      const payload: ChatStreamPayload = {
        messages: [{ content: 'Test', role: 'user' }],
        model: 'test-model',
        temperature: 0.7,
        stream: false,
      };

      await instance.chat(payload);

      expect(customTransformHandler).toHaveBeenCalledWith(mockResponse);
    });

    describe('DEBUG', () => {
      it('should call debugStream and return StreamingTextResponse when DEBUG_OPENROUTER_CHAT_COMPLETION is 1', async () => {
        // Arrange
        const mockProdStream = new ReadableStream() as any; // Mocked prod stream
        const mockDebugStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Debug stream content');
            controller.close();
          },
        }) as any;
        mockDebugStream.toReadableStream = () => mockDebugStream; // Add toReadableStream method

        // Mock chat.completions.create return value, including mocked tee method
        (instance['client'].chat.completions.create as Mock).mockResolvedValue({
          tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
        });

        // Save original environment variable value
        const originalDebugValue = process.env.DEBUG_MOCKPROVIDER_CHAT_COMPLETION;

        // Mock environment variable
        process.env.DEBUG_MOCKPROVIDER_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // Execute test
        // Run your test function, ensuring it calls debugStream when conditions are met
        // Hypothetical test function call, you may need to adjust based on actual situation
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'mistralai/mistral-7b-instruct:free',
          temperature: 0,
        });

        // Verify debugStream is called
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // Restore original environment variable value
        process.env.DEBUG_MOCKPROVIDER_CHAT_COMPLETION = originalDebugValue;
      });
    });
  });

  describe('createImage', () => {
    beforeEach(() => {
      // Mock convertImageUrlToFile since it's already tested in openaiHelpers.test.ts
      vi.spyOn(openaiHelpers, 'convertImageUrlToFile').mockResolvedValue(
        new File(['mock-file-content'], 'test-image.jpg', { type: 'image/jpeg' }),
      );
    });

    describe('basic image generation', () => {
      it('should generate image successfully without imageUrls', async () => {
        const mockResponse = {
          data: [
            {
              b64_json:
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            },
          ],
        };

        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockResponse as any);

        const payload = {
          model: 'dall-e-3',
          params: {
            prompt: 'A beautiful sunset',
            size: '1024x1024',
            quality: 'standard',
          },
        };

        const result = await (instance as any).createImage(payload);

        expect(instance['client'].images.generate).toHaveBeenCalledWith({
          model: 'dall-e-3',
          n: 1,
          prompt: 'A beautiful sunset',
          size: '1024x1024',
          quality: 'standard',
          response_format: 'b64_json',
        });

        expect(result).toEqual({
          imageUrl:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        });
      });

      it('should handle size auto parameter correctly', async () => {
        const mockResponse = {
          data: [{ b64_json: 'mock-base64-data' }],
        };

        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockResponse as any);

        const payload = {
          model: 'dall-e-3',
          params: {
            prompt: 'A beautiful sunset',
            size: 'auto',
          },
        };

        await (instance as any).createImage(payload);

        // size: 'auto' should be removed from the options
        expect(instance['client'].images.generate).toHaveBeenCalledWith({
          model: 'dall-e-3',
          n: 1,
          prompt: 'A beautiful sunset',
          response_format: 'b64_json',
        });
      });

      it('should not add response_format parameter for gpt-image-1 model', async () => {
        const mockResponse = {
          data: [{ b64_json: 'gpt-image-1-base64-data' }],
        };

        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockResponse as any);

        const payload = {
          model: 'gpt-image-1',
          params: {
            prompt: 'A modern digital artwork',
            size: '1024x1024',
          },
        };

        const result = await (instance as any).createImage(payload);

        // gpt-image-1 model should not include response_format parameter
        expect(instance['client'].images.generate).toHaveBeenCalledWith({
          model: 'gpt-image-1',
          n: 1,
          prompt: 'A modern digital artwork',
          size: '1024x1024',
        });

        expect(result).toEqual({
          imageUrl: 'data:image/png;base64,gpt-image-1-base64-data',
        });
      });
    });

    describe('image editing', () => {
      it('should edit image with single imageUrl', async () => {
        const mockResponse = {
          data: [{ b64_json: 'edited-image-base64' }],
        };

        vi.spyOn(instance['client'].images, 'edit').mockResolvedValue(mockResponse as any);

        const payload = {
          model: 'dall-e-2',
          params: {
            prompt: 'Add a rainbow to this image',
            imageUrls: ['https://example.com/image1.jpg'],
            mask: 'https://example.com/mask.jpg',
          },
        };

        const result = await (instance as any).createImage(payload);

        expect(openaiHelpers.convertImageUrlToFile).toHaveBeenCalledWith(
          'https://example.com/image1.jpg',
        );
        expect(instance['client'].images.edit).toHaveBeenCalledWith({
          model: 'dall-e-2',
          n: 1,
          prompt: 'Add a rainbow to this image',
          image: expect.any(File),
          mask: 'https://example.com/mask.jpg',
          response_format: 'b64_json',
          input_fidelity: 'high',
        });

        expect(result).toEqual({
          imageUrl: 'data:image/png;base64,edited-image-base64',
        });
      });

      it('should edit image with multiple imageUrls', async () => {
        const mockResponse = {
          data: [{ b64_json: 'edited-multiple-images-base64' }],
        };

        const mockFile1 = new File(['content1'], 'image1.jpg', { type: 'image/jpeg' });
        const mockFile2 = new File(['content2'], 'image2.jpg', { type: 'image/jpeg' });

        vi.mocked(openaiHelpers.convertImageUrlToFile)
          .mockResolvedValueOnce(mockFile1)
          .mockResolvedValueOnce(mockFile2);

        vi.spyOn(instance['client'].images, 'edit').mockResolvedValue(mockResponse as any);

        const payload = {
          model: 'dall-e-2',
          params: {
            prompt: 'Merge these images',
            imageUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
          },
        };

        const result = await (instance as any).createImage(payload);

        expect(openaiHelpers.convertImageUrlToFile).toHaveBeenCalledTimes(2);
        expect(openaiHelpers.convertImageUrlToFile).toHaveBeenCalledWith(
          'https://example.com/image1.jpg',
        );
        expect(openaiHelpers.convertImageUrlToFile).toHaveBeenCalledWith(
          'https://example.com/image2.jpg',
        );

        expect(instance['client'].images.edit).toHaveBeenCalledWith({
          model: 'dall-e-2',
          n: 1,
          prompt: 'Merge these images',
          image: [mockFile1, mockFile2],
          response_format: 'b64_json',
          input_fidelity: 'high',
        });

        expect(result).toEqual({
          imageUrl: 'data:image/png;base64,edited-multiple-images-base64',
        });
      });

      it('should handle convertImageUrlToFile error', async () => {
        vi.mocked(openaiHelpers.convertImageUrlToFile).mockRejectedValue(
          new Error('Failed to download image'),
        );

        const payload = {
          model: 'dall-e-2',
          params: {
            prompt: 'Edit this image',
            imageUrls: ['https://invalid-url.com/image.jpg'],
          },
        };

        await expect((instance as any).createImage(payload)).rejects.toThrow(
          'Failed to convert image URLs to File objects: Error: Failed to download image',
        );
      });
    });

    describe('error handling', () => {
      it('should throw error when API response is invalid - no data', async () => {
        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue({} as any);

        const payload = {
          model: 'dall-e-3',
          params: { prompt: 'Test prompt' },
        };

        await expect((instance as any).createImage(payload)).rejects.toThrow(
          'Invalid image response: missing or empty data array',
        );
      });

      it('should throw error when API response is invalid - empty data array', async () => {
        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue({
          data: [],
        } as any);

        const payload = {
          model: 'dall-e-3',
          params: { prompt: 'Test prompt' },
        };

        await expect((instance as any).createImage(payload)).rejects.toThrow(
          'Invalid image response: missing or empty data array',
        );
      });

      it('should throw error when first data item is null', async () => {
        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue({
          data: [null],
        } as any);

        const payload = {
          model: 'dall-e-3',
          params: { prompt: 'Test prompt' },
        };

        await expect((instance as any).createImage(payload)).rejects.toThrow(
          'Invalid image response: first data item is null or undefined',
        );
      });

      it('should handle url format response successfully', async () => {
        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue({
          data: [{ url: 'https://example.com/generated-image.jpg' }],
        } as any);

        const payload = {
          model: 'dall-e-3',
          params: { prompt: 'Test prompt' },
        };

        const result = await (instance as any).createImage(payload);

        expect(result).toEqual({
          imageUrl: 'https://example.com/generated-image.jpg',
        });
      });

      it('should throw error when both b64_json and url are missing', async () => {
        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue({
          data: [{ some_other_field: 'value' }],
        } as any);

        const payload = {
          model: 'dall-e-3',
          params: { prompt: 'Test prompt' },
        };

        await expect((instance as any).createImage(payload)).rejects.toThrow(
          'Invalid image response: missing both b64_json and url fields',
        );
      });
    });

    describe('parameter mapping', () => {
      it('should map imageUrls parameter to image', async () => {
        const mockResponse = {
          data: [{ b64_json: 'test-base64' }],
        };

        vi.spyOn(instance['client'].images, 'edit').mockResolvedValue(mockResponse as any);

        const payload = {
          model: 'dall-e-2',
          params: {
            prompt: 'Test prompt',
            imageUrls: ['https://example.com/image.jpg'],
            customParam: 'should remain unchanged',
          },
        };

        await (instance as any).createImage(payload);

        expect(instance['client'].images.edit).toHaveBeenCalledWith({
          model: 'dall-e-2',
          n: 1,
          prompt: 'Test prompt',
          image: expect.any(File),
          customParam: 'should remain unchanged',
          response_format: 'b64_json',
          input_fidelity: 'high',
        });
      });

      it('should handle parameters without imageUrls', async () => {
        const mockResponse = {
          data: [{ b64_json: 'test-base64' }],
        };

        vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockResponse as any);

        const payload = {
          model: 'dall-e-3',
          params: {
            prompt: 'Test prompt',
            quality: 'hd',
            style: 'vivid',
          },
        };

        await (instance as any).createImage(payload);

        expect(instance['client'].images.generate).toHaveBeenCalledWith({
          model: 'dall-e-3',
          n: 1,
          prompt: 'Test prompt',
          quality: 'hd',
          style: 'vivid',
          response_format: 'b64_json',
        });
      });
    });
  });

  describe('models', () => {
    it('should get models with third party model list', async () => {
      vi.spyOn(instance['client'].models, 'list').mockResolvedValue({
        data: [
          { id: 'gpt-4o', object: 'model', created: 1698218177 },
          { id: 'claude-3-haiku-20240307', object: 'model' },
          { id: 'gpt-4o-mini', object: 'model', created: 1698318177 * 1000 },
          { id: 'gemini', object: 'model', created: 1736499509125 },
        ],
      } as any);

      const list = await instance.models();

      expect(list).toEqual([
        {
          abilities: {
            functionCall: true,
            vision: true,
          },
          config: {
            deploymentName: 'gpt-4o',
          },
          contextWindowTokens: 128000,
          description:
            'ChatGPT-4o 是一款动态模型，实时更新以保持当前最新版本。它结合了强大的语言理解与生成能力，适合于大规模应用场景，包括客户服务、教育和技术支持。',
          displayName: 'GPT-4o',
          enabled: true,
          id: 'gpt-4o',
          maxOutput: 4096,
          pricing: {
            units: [
              {
                name: 'textInput_cacheRead',
                rate: 1.25,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
              {
                name: 'textInput',
                rate: 2.5,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
              {
                name: 'textOutput',
                rate: 10,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
            ],
          },
          providerId: 'azure',
          releasedAt: '2024-05-13',
          source: 'builtin',
          type: 'chat',
        },
        {
          abilities: {
            functionCall: true,
            vision: true,
          },
          contextWindowTokens: 200000,
          description:
            'Claude 3 Haiku 是 Anthropic 的最快且最紧凑的模型，旨在实现近乎即时的响应。它具有快速且准确的定向性能。',
          displayName: 'Claude 3 Haiku',
          enabled: false,
          id: 'claude-3-haiku-20240307',
          maxOutput: 4096,
          pricing: {
            units: [
              {
                name: 'textInput_cacheRead',
                rate: 0.03,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
              {
                name: 'textInput',
                rate: 0.25,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
              {
                name: 'textOutput',
                rate: 1.25,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
              {
                lookup: {
                  prices: {
                    '1h': 0.5,
                    '5m': 0.3,
                  },
                  pricingParams: ['ttl'],
                },
                name: 'textInput_cacheWrite',
                strategy: 'lookup',
                unit: 'millionTokens',
              },
            ],
          },
          providerId: 'anthropic',
          releasedAt: '2024-03-07',
          settings: {
            extendParams: ['disableContextCaching'],
          },
          source: 'builtin',
          type: 'chat',
        },
        {
          abilities: {
            functionCall: true,
            vision: true,
          },
          config: {
            deploymentName: 'gpt-4o-mini',
          },
          contextWindowTokens: 128000,
          description: 'GPT-4o Mini，小型高效模型，具备与GPT-4o相似的卓越性能。',
          displayName: 'GPT 4o Mini',
          enabled: false,
          id: 'gpt-4o-mini',
          maxOutput: 4096,
          pricing: {
            units: [
              {
                name: 'textInput_cacheRead',
                rate: 0.075,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
              {
                name: 'textInput',
                rate: 0.15,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
              {
                name: 'textOutput',
                rate: 0.6,
                strategy: 'fixed',
                unit: 'millionTokens',
              },
            ],
          },
          providerId: 'azure',
          releasedAt: '2023-10-26',
          source: 'builtin',
          type: 'chat',
        },
        {
          id: 'gemini',
          releasedAt: '2025-01-10',
          type: 'chat',
        },
      ]);
    });
  });
});
