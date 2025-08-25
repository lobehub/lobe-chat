// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeBedrockAI } from './index';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

let instance: LobeBedrockAI;

beforeEach(() => {
  instance = new LobeBedrockAI({
    region: 'us-west-2',
    token: 'test-bearer-token',
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LobeBedrockAI', () => {
  describe('init', () => {
    it('should correctly initialize with bearer token', async () => {
      const instance = new LobeBedrockAI({
        region: 'us-west-2',
        token: 'test-bearer-token',
      });
      expect(instance).toBeInstanceOf(LobeBedrockAI);
      expect(instance.region).toBe('us-west-2');
    });

    it('should throw error when no token provided', async () => {
      expect(() => {
        new LobeBedrockAI({
          region: 'us-west-2',
        });
      }).toThrow();
    });
  });

  describe('chat', () => {
    it('should call invokeBearerTokenModel for all models', async () => {
      // Mock fetch to avoid actual API calls
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"delta":{"text":"Hello"}}\n\n'));
            controller.close();
          },
        }),
      });

      // @ts-ignore
      const spy = vi.spyOn(instance, 'invokeBearerTokenModel');

      // Act
      await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'anthropic.claude-v2:1',
        temperature: 0,
      });

      // Assert
      expect(spy).toHaveBeenCalled();
    });

    it('should return a Response on successful API call', async () => {
      // Mock fetch for bearer token authentication
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"delta":{"text":"Hello"}}\n\n'));
            controller.close();
          },
        }),
      });

      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'anthropic.claude-v2:1',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    it('should call options.callback when provided', async () => {
      // Mock fetch for bearer token authentication
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('data: {"delta":{"text":"Hello"}}\n\n'));
            controller.close();
          },
        }),
      });

      const onStart = vi.fn();

      // Act
      await instance.chat(
        {
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'anthropic.claude-v2:1',
          temperature: 0,
        },
        { callback: { onStart } },
      );

      // Assert
      expect(onStart).toHaveBeenCalled();
    });
  });
});
