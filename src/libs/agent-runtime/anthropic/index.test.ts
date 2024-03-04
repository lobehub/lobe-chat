// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as debugStreamModule from '../utils/debugStream';
import { LobeAnthropicAI } from './index';

const provider = 'anthropic';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeAnthropicAI;

beforeEach(() => {
  instance = new LobeAnthropicAI({ apiKey: 'test' });

  // 使用 vi.spyOn 来模拟 chat.completions.create 方法
  vi.spyOn(instance['client'].messages, 'create').mockReturnValue(new ReadableStream() as any);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeAnthropicAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeAnthropicAI({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeAnthropicAI);
    });
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-instant-1.2',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });
    it('should handle text messages correctly', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      });
      vi.spyOn(instance['client'].messages, 'create').mockReturnValue(
        vi.fn().mockResolvedValue(mockStream) as any,
      );

      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-instant-1.2',
        temperature: 0,
      });

      expect(result).toBeInstanceOf(Response);
    });
    it('should handle system prompt correctly', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      });
      vi.spyOn(instance['client'].messages, 'create').mockReturnValue(
        vi.fn().mockResolvedValue(mockStream) as any,
      );

      const result = await instance.chat({
        messages: [
          { content: 'You are an awesome greeter', role: 'system' },
          { content: 'Hello', role: 'user' },
        ],
        model: 'claude-instant-1.2',
        temperature: 0,
      });

      expect(result).toBeInstanceOf(Response);
    });
    it('should call debugStream in DEBUG mode', async () => {
      // 设置环境变量以启用DEBUG模式
      process.env.DEBUG_GOOGLE_CHAT_COMPLETION = '1';

      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Debug mode test');
          controller.close();
        },
      });
      vi.spyOn(instance['client'].messages, 'create').mockReturnValue(
        vi.fn().mockResolvedValue(mockStream) as any,
      );
      const debugStreamSpy = vi
        .spyOn(debugStreamModule, 'debugStream')
        .mockImplementation(() => Promise.resolve());

      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-instant-1.2',
        temperature: 0,
      });

      expect(debugStreamSpy).toHaveBeenCalled();

      // 清理环境变量
      delete process.env.DEBUG_GOOGLE_CHAT_COMPLETION;
    });

    describe('Error', () => {
      it('should throw InvalidAnthropicAPIKey error on API_KEY_INVALID error', async () => {
        // 模拟 Anthropic AI SDK 抛出异常
        const apiError = {
          status: 401,
          error: {
            type: 'error',
            error: {
              type: 'authentication_error',
              message: 'invalid x-api-key',
            },
          },
        };

        vi.spyOn(instance['client'].messages, 'create').mockReturnValue(
          vi.fn().mockRejectedValue(apiError) as any,
        );

        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-instant-1.2',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({ errorType: 'InvalidAnthropicAPIKey', error: apiError, provider });
        }
      });

      it('should throw LocationNotSupportError error on location not support error', async () => {
        // 模拟 Anthropic AI SDK 抛出异常
        const apiError = {
          status: 403,
          error: {
            type: 'error',
            error: {
              type: 'forbidden',
              message: 'Request not allowed',
            },
          },
        };

        vi.spyOn(instance['client'].messages, 'create').mockReturnValue(
          vi.fn().mockRejectedValue(apiError) as any,
        );
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-instant-1.2',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({ errorType: 'LocationNotSupportError', error: apiError, provider });
        }
      });

      it('should throw BizError error', async () => {
        // 模拟 Anthropic AI SDK 抛出异常
        const apiError = {
          status: 529,
          error: {
            type: 'error',
            error: {
              type: 'overloaded_error',
              message: "Anthropic's API is temporarily overloaded",
            },
          },
        };

        vi.spyOn(instance['client'].messages, 'create').mockReturnValue(
          vi.fn().mockRejectedValue(apiError) as any,
        );
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-instant-1.2',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({ errorType: 'AnthropicBizError', error: apiError, provider });
        }
      });

      it('should throw AgentRuntimeError with NoOpenAIAPIKey if no apiKey is provided', async () => {
        try {
          new LobeAnthropicAI({});
        } catch (e) {
          expect(e).toEqual({ errorType: 'InvalidAnthropicAPIKey' });
        }
      });
    });
  });
});
