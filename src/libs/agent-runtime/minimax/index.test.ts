// @vitest-environment edge-runtime
import { StreamingTextResponse } from 'ai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatStreamPayload, ModelProvider } from '@/libs/agent-runtime';
import * as debugStreamModule from '@/libs/agent-runtime/utils/debugStream';

import { LobeMinimaxAI } from './index';

const provider = ModelProvider.Minimax;
const bizErrorType = 'MinimaxBizError';
const invalidErrorType = 'InvalidMinimaxAPIKey';
const encoder = new TextEncoder();

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeMinimaxAI;

beforeEach(() => {
  instance = new LobeMinimaxAI({ apiKey: 'test' });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeMinimaxAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeMinimaxAI({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeMinimaxAI);
    });

    it('should throw AgentRuntimeError with InvalidMinimaxAPIKey if no apiKey is provided', async () => {
      try {
        new LobeMinimaxAI({});
      } catch (e) {
        expect(e).toEqual({ errorType: invalidErrorType });
      }
    });
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      const mockResponseData = {
        choices: [{ delta: { content: 'Hello, world!' } }],
      };
      const mockResponse = new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(mockResponseData)}`));
            controller.close();
          },
        }),
      );
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      expect(result).toBeInstanceOf(StreamingTextResponse);
    });

    it('should handle text messages correctly', async () => {
      const mockResponseData = {
        choices: [{ delta: { content: 'Hello, world!' } }],
      };
      const mockResponse = new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(mockResponseData)}`));
            controller.close();
          },
        }),
      );
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      expect(result).toBeInstanceOf(StreamingTextResponse);
    });

    it('should call debugStream in DEBUG mode', async () => {
      process.env.DEBUG_MINIMAX_CHAT_COMPLETION = '1';

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(JSON.stringify('Hello, world!')));
              controller.close();
            },
          }),
        ),
      );

      vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      // Assert
      expect(debugStreamModule.debugStream).toHaveBeenCalled();

      delete process.env.DEBUG_MINIMAX_CHAT_COMPLETION;
    });

    describe('Error', () => {
      it('should throw InvalidMinimaxAPIKey error on API_KEY_INVALID error', async () => {
        const mockErrorResponse = {
          base_resp: {
            status_code: 1004,
            status_msg: 'API key not valid',
          },
        };
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
          new Response(
            new ReadableStream({
              start(controller) {
                controller.enqueue(encoder.encode(JSON.stringify(mockErrorResponse)));
                controller.close();
              },
            }),
          ),
        );

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            errorType: invalidErrorType,
            error: {
              code: 1004,
              message: 'API key not valid',
            },
            provider,
          });
        }
      });

      it('should throw MinimaxBizError error on other error status codes', async () => {
        const mockErrorResponse = {
          base_resp: {
            status_code: 1001,
            status_msg: 'Some error occurred',
          },
        };
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
          new Response(
            new ReadableStream({
              start(controller) {
                controller.enqueue(encoder.encode(JSON.stringify(mockErrorResponse)));
                controller.close();
              },
            }),
          ),
        );

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
              code: 1001,
              message: 'Some error occurred',
            },
            provider,
          });
        }
      });

      it('should throw MinimaxBizError error on generic errors', async () => {
        const mockError = new Error('Something went wrong');
        vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(mockError);

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
              cause: undefined,
              message: 'Something went wrong',
              name: 'Error',
              stack: mockError.stack,
            },
            provider,
          });
        }
      });
    });
  });

  describe('private methods', () => {
    describe('buildCompletionsParams', () => {
      it('should build the correct parameters', () => {
        const payload: ChatStreamPayload = {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0.5,
          top_p: 0.8,
        };

        const result = instance['buildCompletionsParams'](payload);

        expect(result).toEqual({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          stream: true,
          temperature: 0.5,
          top_p: 0.8,
        });
      });

      it('should exclude temperature and top_p when they are 0', () => {
        const payload: ChatStreamPayload = {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
          top_p: 0,
        };

        const result = instance['buildCompletionsParams'](payload);

        expect(result).toEqual({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          stream: true,
        });
      });

      it('should include max tokens when model is abab6.5-chat', () => {
        const payload: ChatStreamPayload = {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'abab6.5-chat',
          temperature: 0,
          top_p: 0,
        };

        const result = instance['buildCompletionsParams'](payload);

        expect(result).toEqual({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'abab6.5-chat',
          stream: true,
          max_tokens: 2048,
        });
      });
    });
  });
});
