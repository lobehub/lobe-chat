// @vitest-environment node
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatCompletionTool } from '@/libs/agent-runtime';

import * as anthropicHelpers from '../utils/anthropicHelpers';
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

  vi.spyOn(instance['client'].beta.tools.messages, 'create').mockReturnValue({
    content: [],
  } as any);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeAnthropicAI', () => {
  describe('init', () => {
    it('should correctly initialize with an API key', async () => {
      const instance = new LobeAnthropicAI({ apiKey: 'test_api_key' });
      expect(instance).toBeInstanceOf(LobeAnthropicAI);
      expect(instance.baseURL).toBe('https://api.anthropic.com');
    });

    it('should correctly initialize with a baseURL', async () => {
      const instance = new LobeAnthropicAI({
        apiKey: 'test_api_key',
        baseURL: 'https://api.anthropic.proxy',
      });
      expect(instance).toBeInstanceOf(LobeAnthropicAI);
      expect(instance.baseURL).toBe('https://api.anthropic.proxy');
    });
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-3-haiku-20240307',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    it('should handle text messages correctly', async () => {
      // Arrange
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      });
      const mockResponse = Promise.resolve(mockStream);
      (instance['client'].messages.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-3-haiku-20240307',
        temperature: 0,
        top_p: 1,
      });

      // Assert
      expect(instance['client'].messages.create).toHaveBeenCalledWith(
        {
          max_tokens: 4096,
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'claude-3-haiku-20240307',
          stream: true,
          temperature: 0,
          top_p: 1,
        },
        {},
      );
      expect(result).toBeInstanceOf(Response);
    });

    it('should handle system prompt correctly', async () => {
      // Arrange
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      });
      const mockResponse = Promise.resolve(mockStream);
      (instance['client'].messages.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [
          { content: 'You are an awesome greeter', role: 'system' },
          { content: 'Hello', role: 'user' },
        ],
        model: 'claude-3-haiku-20240307',
        temperature: 0,
      });

      // Assert
      expect(instance['client'].messages.create).toHaveBeenCalledWith(
        {
          max_tokens: 4096,
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'claude-3-haiku-20240307',
          stream: true,
          system: 'You are an awesome greeter',
          temperature: 0,
        },
        {},
      );
      expect(result).toBeInstanceOf(Response);
    });

    it('should call Anthropic API with supported opions in streaming mode', async () => {
      // Arrange
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      });
      const mockResponse = Promise.resolve(mockStream);
      (instance['client'].messages.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        max_tokens: 2048,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-3-haiku-20240307',
        temperature: 0.5,
        top_p: 1,
      });

      // Assert
      expect(instance['client'].messages.create).toHaveBeenCalledWith(
        {
          max_tokens: 2048,
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'claude-3-haiku-20240307',
          stream: true,
          temperature: 0.5,
          top_p: 1,
        },
        {},
      );
      expect(result).toBeInstanceOf(Response);
    });

    it('should call Anthropic API without unsupported opions', async () => {
      // Arrange
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      });
      const mockResponse = Promise.resolve(mockStream);
      (instance['client'].messages.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        frequency_penalty: 0.5, // Unsupported option
        max_tokens: 2048,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-3-haiku-20240307',
        presence_penalty: 0.5,
        temperature: 0.5,
        top_p: 1,
      });

      // Assert
      expect(instance['client'].messages.create).toHaveBeenCalledWith(
        {
          max_tokens: 2048,
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'claude-3-haiku-20240307',
          stream: true,
          temperature: 0.5,
          top_p: 1,
        },
        {},
      );
      expect(result).toBeInstanceOf(Response);
    });

    it('should call debugStream in DEBUG mode', async () => {
      // Arrange
      const mockProdStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Hello, world!');
          controller.close();
        },
      }) as any;
      const mockDebugStream = new ReadableStream({
        start(controller) {
          controller.enqueue('Debug stream content');
          controller.close();
        },
      }) as any;
      mockDebugStream.toReadableStream = () => mockDebugStream;

      (instance['client'].messages.create as Mock).mockResolvedValue({
        tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
      });

      const originalDebugValue = process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION;

      process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION = '1';
      vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

      // Act
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-3-haiku-20240307',
        temperature: 0,
      });

      // Assert
      expect(debugStreamModule.debugStream).toHaveBeenCalled();

      // Cleanup
      process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION = originalDebugValue;
    });

    describe('chat with tools', () => {
      it('should call client.beta.tools.messages.create when tools are provided', async () => {
        // Arrange
        const tools: ChatCompletionTool[] = [
          { function: { name: 'tool1', description: 'desc1' }, type: 'function' },
        ];
        const spyOn = vi.spyOn(anthropicHelpers, 'buildAnthropicTools');

        // Act
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'claude-3-haiku-20240307',
          temperature: 1,
          tools,
        });

        // Assert
        expect(instance['client'].beta.tools.messages.create).toHaveBeenCalled();
        expect(spyOn).toHaveBeenCalledWith(tools);
      });

      it('should handle text and tool_use content correctly in transformResponseToStream', async () => {
        // Arrange
        const mockResponse = {
          content: [
            { type: 'text', text: 'Hello' },
            { type: 'tool_use', id: 'tool1', name: 'tool1', input: 'input1' },
          ],
        };
        // @ts-ignore
        vi.spyOn(instance, 'transformResponseToStream').mockReturnValue(new ReadableStream());
        vi.spyOn(instance['client'].beta.tools.messages, 'create').mockResolvedValue(
          mockResponse as any,
        );

        // Act
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'claude-3-haiku-20240307',
          temperature: 0,
          tools: [{ function: { name: 'tool1', description: 'desc1' }, type: 'function' }],
        });

        // Assert
        expect(instance['transformResponseToStream']).toHaveBeenCalledWith(mockResponse);
      });
    });

    describe('Error', () => {
      it('should throw InvalidAnthropicAPIKey error on API_KEY_INVALID error', async () => {
        // Arrange
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
        (instance['client'].messages.create as Mock).mockRejectedValue(apiError);

        try {
          // Act
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-3-haiku-20240307',
            temperature: 0,
          });
        } catch (e) {
          // Assert
          expect(e).toEqual({
            endpoint: 'https://api.anthropic.com',
            error: apiError,
            errorType: 'InvalidAnthropicAPIKey',
            provider,
          });
        }
      });
      it('should throw BizError error', async () => {
        // Arrange
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
        (instance['client'].messages.create as Mock).mockRejectedValue(apiError);

        try {
          // Act
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-3-haiku-20240307',
            temperature: 0,
          });
        } catch (e) {
          // Assert
          expect(e).toEqual({
            endpoint: 'https://api.anthropic.com',
            error: apiError,
            errorType: 'AnthropicBizError',
            provider,
          });
        }
      });

      it('should throw InvalidAnthropicAPIKey if no apiKey is provided', async () => {
        try {
          new LobeAnthropicAI({});
        } catch (e) {
          expect(e).toEqual({ errorType: 'InvalidAnthropicAPIKey' });
        }
      });
    });

    describe('Error handling', () => {
      it('should throw LocationNotSupportError on 403 error', async () => {
        // Arrange
        const apiError = { status: 403 };
        (instance['client'].messages.create as Mock).mockRejectedValue(apiError);

        // Act & Assert
        await expect(
          instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-3-haiku-20240307',
            temperature: 1,
          }),
        ).rejects.toEqual({
          endpoint: 'https://api.anthropic.com',
          error: apiError,
          errorType: 'LocationNotSupportError',
          provider,
        });
      });

      it('should throw AnthropicBizError on other error status codes', async () => {
        // Arrange
        const apiError = { status: 500 };
        (instance['client'].messages.create as Mock).mockRejectedValue(apiError);

        // Act & Assert
        await expect(
          instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-3-haiku-20240307',
            temperature: 1,
          }),
        ).rejects.toEqual({
          endpoint: 'https://api.anthropic.com',
          error: apiError,
          errorType: 'AnthropicBizError',
          provider,
        });
      });

      it('should desensitize custom baseURL in error message', async () => {
        // Arrange
        const apiError = { status: 401 };
        const customInstance = new LobeAnthropicAI({
          apiKey: 'test',
          baseURL: 'https://api.custom.com/v1',
        });
        vi.spyOn(customInstance['client'].messages, 'create').mockRejectedValue(apiError);

        // Act & Assert
        await expect(
          customInstance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-3-haiku-20240307',
            temperature: 0,
          }),
        ).rejects.toEqual({
          endpoint: 'https://api.cu****om.com/v1',
          error: apiError,
          errorType: 'InvalidAnthropicAPIKey',
          provider,
        });
      });
    });

    describe('Options', () => {
      it('should pass signal to API call', async () => {
        // Arrange
        const controller = new AbortController();

        // Act
        await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-3-haiku-20240307',
            temperature: 1,
          },
          { signal: controller.signal },
        );

        // Assert
        expect(instance['client'].messages.create).toHaveBeenCalledWith(
          expect.objectContaining({}),
          { signal: controller.signal },
        );
      });

      it('should apply callback to the returned stream', async () => {
        // Arrange
        const callback = vi.fn();

        // Act
        await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-3-haiku-20240307',
            temperature: 0,
          },
          {
            callback: { onStart: callback },
          },
        );

        // Assert
        expect(callback).toHaveBeenCalled();
      });

      it('should set headers on the response', async () => {
        // Arrange
        const headers = { 'X-Test-Header': 'test' };

        // Act
        const result = await instance.chat(
          {
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'claude-3-haiku-20240307',
            temperature: 1,
          },
          { headers },
        );

        // Assert
        expect(result.headers.get('X-Test-Header')).toBe('test');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty messages array', async () => {
        // Act & Assert
        await expect(
          instance.chat({
            messages: [],
            model: 'claude-3-haiku-20240307',
            temperature: 1,
          }),
        ).resolves.toBeInstanceOf(Response);
      });
    });
  });
});
