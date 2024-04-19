// @vitest-environment edge-runtime
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatStreamPayload, ModelProvider } from '@/libs/agent-runtime';
import * as fetchSSEModule from '@/utils/fetch';

import { LobeMinimaxAI } from './index';

const provider = ModelProvider.Minimax;
const bizErrorType = 'MinimaxBizError';
const invalidErrorType = 'InvalidMinimaxAPIKey';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeMinimaxAI;

beforeEach(() => {
  instance = new LobeMinimaxAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 fetchSSE 方法
  vi.spyOn(fetchSSEModule, 'fetchSSE').mockResolvedValue(new Response());
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
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      });
      vi.spyOn(fetchSSEModule, 'fetchSSE').mockResolvedValue(new Response(mockStream));

      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      expect(result).toBeInstanceOf(Response);
    });

    it('should handle text messages correctly', async () => {
      const mockResponseData = {
        choices: [{ delta: { content: 'Hello, world!' } }],
      };
      vi.spyOn(fetchSSEModule, 'fetchSSE').mockResolvedValue(
        new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(JSON.stringify(mockResponseData));
              controller.close();
            },
          }),
        ),
      );

      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      expect(fetchSSEModule.fetchSSE).toHaveBeenCalledWith(expect.any(Function), {
        onFinish: expect.any(Function),
        onMessageHandle: expect.any(Function),
      });
      expect(result).toBeInstanceOf(Response);
    });

    describe('Error', () => {
      it('should throw InvalidMinimaxAPIKey error on API_KEY_INVALID error', async () => {
        const mockErrorResponse = {
          base_resp: {
            status_code: 1004,
            status_msg: 'API key not valid',
          },
        };
        vi.spyOn(fetchSSEModule, 'fetchSSE').mockResolvedValue(
          new Response(
            new ReadableStream({
              start(controller) {
                controller.enqueue(JSON.stringify(mockErrorResponse));
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
        vi.spyOn(fetchSSEModule, 'fetchSSE').mockResolvedValue(
          new Response(
            new ReadableStream({
              start(controller) {
                controller.enqueue(JSON.stringify(mockErrorResponse));
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
        vi.spyOn(fetchSSEModule, 'fetchSSE').mockRejectedValue(mockError);

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
          max_tokens: 100,
        };

        const result = instance['buildCompletionsParams'](payload);

        expect(result).toEqual({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          stream: true,
          temperature: 0.5,
          top_p: 0.8,
          max_tokens: 100,
        });
      });

      it('should exclude temperature and top_p when they are 0', () => {
        const payload: ChatStreamPayload = {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
          top_p: 0,
          max_tokens: 100,
        };

        const result = instance['buildCompletionsParams'](payload);

        expect(result).toEqual({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          stream: true,
          max_tokens: 100,
        });
      });
    });
  });
});
