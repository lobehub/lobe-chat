// @vitest-environment node
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
      expect(instance.baseURL).toBe('https://api.anthropic.com');
    });
    
    it('should correctly initialize with a baseURL', async () => {
      const instance = new LobeAnthropicAI({ apiKey: 'test_api_key', baseURL: 'https://api.anthropic.proxy' });
      expect(instance).toBeInstanceOf(LobeAnthropicAI);
      expect(instance.baseURL).toBe('https://api.anthropic.proxy');
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
        model: 'claude-instant-1.2',
        temperature: 0,
        top_p: 1,
      });

      // Assert
      expect(instance['client'].messages.create).toHaveBeenCalledWith({
        max_tokens: 4096,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-instant-1.2',
        stream: true,
        temperature: 0,
        top_p: 1,
      });
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
        model: 'claude-instant-1.2',
        temperature: 0,
      });

      // Assert
      expect(instance['client'].messages.create).toHaveBeenCalledWith({
        max_tokens: 4096,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-instant-1.2',
        stream: true,
        system: 'You are an awesome greeter',
        temperature: 0,
      });
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
        model: 'claude-instant-1.2',
        temperature: 0.5,
        top_p: 1,
      });

      // Assert
      expect(instance['client'].messages.create).toHaveBeenCalledWith({
        max_tokens: 2048,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-instant-1.2',
        stream: true,
        temperature: 0.5,
        top_p: 1,
      });
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
        model: 'claude-instant-1.2',
        presence_penalty: 0.5,
        temperature: 0.5,
        top_p: 1,
      });

      // Assert
      expect(instance['client'].messages.create).toHaveBeenCalledWith({
        max_tokens: 2048,
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'claude-instant-1.2',
        stream: true,
        temperature: 0.5,
        top_p: 1,
      });
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
        model: 'claude-instant-1.2',
        temperature: 0,
      });

      // Assert
      expect(debugStreamModule.debugStream).toHaveBeenCalled();

      // Cleanup
      process.env.DEBUG_ANTHROPIC_CHAT_COMPLETION = originalDebugValue;
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
            model: 'claude-instant-1.2',
            temperature: 0,
          });
        } catch (e) {
          // Assert
          expect(e).toEqual({
            endpoint: "https://api.anthropic.com",
            error: apiError,
            errorType: 'InvalidAnthropicAPIKey',
            provider
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
            model: 'claude-instant-1.2',
            temperature: 0,
          });
        } catch (e) {
          // Assert
          expect(e).toEqual({
            endpoint: "https://api.anthropic.com",
            error: apiError,
            errorType: 'AnthropicBizError',
            provider
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
  });
});
