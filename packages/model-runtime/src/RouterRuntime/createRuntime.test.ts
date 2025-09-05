import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LobeRuntimeAI } from '../BaseAI';
import { createRouterRuntime } from './createRuntime';

describe('createRouterRuntime', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('initialization', () => {
    it('should throw error when routers array is empty', () => {
      expect(() => {
        const Runtime = createRouterRuntime({
          id: 'test-runtime',
          routers: [],
        });
        new Runtime();
      }).toThrow('empty providers');
    });

    it('should create UniformRuntime class with valid routers', () => {
      class MockRuntime implements LobeRuntimeAI {
        chat = vi.fn();
        textToImage = vi.fn();
        models = vi.fn();
        embeddings = vi.fn();
        textToSpeech = vi.fn();
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: { apiKey: 'test-key' },
            runtime: MockRuntime as any,
            models: ['gpt-4', 'gpt-3.5-turbo'],
          },
        ],
      });

      const runtime = new Runtime();
      expect(runtime).toBeDefined();
    });

    it('should merge router options with constructor options', () => {
      const mockConstructor = vi.fn();

      class MockRuntime implements LobeRuntimeAI {
        constructor(options: any) {
          mockConstructor(options);
        }
        chat = vi.fn();
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: { baseURL: 'https://api.example.com' },
            runtime: MockRuntime as any,
          },
        ],
      });

      new Runtime({ apiKey: 'constructor-key' });

      expect(mockConstructor).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.example.com',
          apiKey: 'constructor-key',
          id: 'test-runtime',
        }),
      );
    });
  });

  describe('getModels', () => {
    it('should return synchronous models array directly', async () => {
      const mockRuntime = {
        chat: vi.fn(),
      } as unknown as LobeRuntimeAI;

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: mockRuntime.constructor as any,
            models: ['model-1', 'model-2'],
          },
        ],
      });

      const runtime = new Runtime();
      const models = await runtime['getRouterMatchModels']({
        id: 'test',
        models: ['model-1', 'model-2'],
        runtime: mockRuntime,
      });

      expect(models).toEqual(['model-1', 'model-2']);
    });

    it('should call asynchronous models function', async () => {
      const mockRuntime = {
        chat: vi.fn(),
      } as unknown as LobeRuntimeAI;

      const mockModelsFunction = vi.fn().mockResolvedValue(['async-model-1', 'async-model-2']);

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: mockRuntime.constructor as any,
            models: mockModelsFunction,
          },
        ],
      });

      const runtime = new Runtime();
      const runtimeItem = {
        id: 'test',
        models: mockModelsFunction,
        runtime: mockRuntime,
      };

      // Call the function
      const models = await runtime['getRouterMatchModels'](runtimeItem);
      expect(models).toEqual(['async-model-1', 'async-model-2']);
      expect(mockModelsFunction).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when models is undefined', async () => {
      const mockRuntime = {
        chat: vi.fn(),
      } as unknown as LobeRuntimeAI;

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: mockRuntime.constructor as any,
          },
        ],
      });

      const runtime = new Runtime();
      const models = await runtime['getRouterMatchModels']({
        id: 'test',
        runtime: mockRuntime,
      });

      expect(models).toEqual([]);
    });
  });

  describe('getRuntimeByModel', () => {
    it('should return runtime that supports the model', async () => {
      class MockRuntime1 implements LobeRuntimeAI {
        chat = vi.fn();
      }

      class MockRuntime2 implements LobeRuntimeAI {
        chat = vi.fn();
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime1 as any,
            models: ['gpt-4'],
          },
          {
            apiType: 'anthropic',
            options: {},
            runtime: MockRuntime2 as any,
            models: ['claude-3'],
          },
        ],
      });

      const runtime = new Runtime();

      const result1 = await runtime.getRuntimeByModel('gpt-4');
      expect(result1).toBe(runtime['_runtimes'][0].runtime);

      const result2 = await runtime.getRuntimeByModel('claude-3');
      expect(result2).toBe(runtime['_runtimes'][1].runtime);
    });

    it('should return last runtime when no model matches', async () => {
      class MockRuntime1 implements LobeRuntimeAI {
        chat = vi.fn();
      }

      class MockRuntime2 implements LobeRuntimeAI {
        chat = vi.fn();
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime1 as any,
            models: ['gpt-4'],
          },
          {
            apiType: 'anthropic',
            options: {},
            runtime: MockRuntime2 as any,
            models: ['claude-3'],
          },
        ],
      });

      const runtime = new Runtime();
      const result = await runtime.getRuntimeByModel('unknown-model');

      expect(result).toBe(runtime['_runtimes'][1].runtime);
    });
  });

  describe('chat method', () => {
    it('should call chat on the correct runtime based on model', async () => {
      const mockChat = vi.fn().mockResolvedValue('chat-response');

      class MockRuntime implements LobeRuntimeAI {
        chat = mockChat;
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime as any,
            models: ['gpt-4'],
          },
        ],
      });

      const runtime = new Runtime();
      const payload = { model: 'gpt-4', messages: [], temperature: 0.7 };

      const result = await runtime.chat(payload);
      expect(result).toBe('chat-response');
      expect(mockChat).toHaveBeenCalledWith(payload, undefined);
    });

    it('should handle errors when provided with handleError', async () => {
      const mockError = new Error('API Error');
      const mockChat = vi.fn().mockRejectedValue(mockError);

      class MockRuntime implements LobeRuntimeAI {
        chat = mockChat;
      }

      const handleError = vi.fn().mockReturnValue({
        errorType: 'APIError',
        message: 'Handled error',
      });

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime as any,
            models: ['gpt-4'],
          },
        ],
      });

      const runtime = new Runtime({
        chat: {
          handleError,
        },
      });

      await expect(
        runtime.chat({ model: 'gpt-4', messages: [], temperature: 0.7 }),
      ).rejects.toEqual({
        errorType: 'APIError',
        message: 'Handled error',
      });
    });

    it('should re-throw original error when handleError returns undefined', async () => {
      const mockError = new Error('API Error');
      const mockChat = vi.fn().mockRejectedValue(mockError);

      class MockRuntime implements LobeRuntimeAI {
        chat = mockChat;
      }

      const handleError = vi.fn().mockReturnValue(undefined);

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime as any,
            models: ['gpt-4'],
          },
        ],
      });

      const runtime = new Runtime({
        chat: {
          handleError,
        },
      });

      await expect(runtime.chat({ model: 'gpt-4', messages: [], temperature: 0.7 })).rejects.toBe(
        mockError,
      );
    });
  });

  describe('textToImage method', () => {
    it('should call textToImage on the correct runtime based on model', async () => {
      const mockTextToImage = vi.fn().mockResolvedValue('image-response');

      class MockRuntime implements LobeRuntimeAI {
        textToImage = mockTextToImage;
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime as any,
            models: ['dall-e-3'],
          },
        ],
      });

      const runtime = new Runtime();
      const payload = { model: 'dall-e-3', prompt: 'test prompt' };

      const result = await runtime.textToImage(payload);
      expect(result).toBe('image-response');
      expect(mockTextToImage).toHaveBeenCalledWith(payload);
    });
  });

  describe('models method', () => {
    it('should call models method on first runtime', async () => {
      const mockModels = vi.fn().mockResolvedValue(['model-1', 'model-2']);

      class MockRuntime implements LobeRuntimeAI {
        models = mockModels;
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime as any,
          },
        ],
      });

      const runtime = new Runtime();
      const result = await runtime.models();

      expect(result).toEqual(['model-1', 'model-2']);
      expect(mockModels).toHaveBeenCalled();
    });
  });

  describe('embeddings method', () => {
    it('should call embeddings on the correct runtime based on model', async () => {
      const mockEmbeddings = vi.fn().mockResolvedValue('embeddings-response');

      class MockRuntime implements LobeRuntimeAI {
        embeddings = mockEmbeddings;
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime as any,
            models: ['text-embedding-ada-002'],
          },
        ],
      });

      const runtime = new Runtime();
      const payload = { model: 'text-embedding-ada-002', input: 'test input' };
      const options = {} as any;

      const result = await runtime.embeddings(payload, options);
      expect(result).toBe('embeddings-response');
      expect(mockEmbeddings).toHaveBeenCalledWith(payload, options);
    });
  });

  describe('textToSpeech method', () => {
    it('should call textToSpeech on the correct runtime based on model', async () => {
      const mockTextToSpeech = vi.fn().mockResolvedValue('speech-response');

      class MockRuntime implements LobeRuntimeAI {
        textToSpeech = mockTextToSpeech;
      }

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: [
          {
            apiType: 'openai',
            options: {},
            runtime: MockRuntime as any,
            models: ['tts-1'],
          },
        ],
      });

      const runtime = new Runtime();
      const payload = { model: 'tts-1', input: 'Hello world', voice: 'alloy' };
      const options = {} as any;

      const result = await runtime.textToSpeech(payload, options);
      expect(result).toBe('speech-response');
      expect(mockTextToSpeech).toHaveBeenCalledWith(payload, options);
    });
  });

  describe('dynamic routers configuration', () => {
    it('should support function-based routers configuration', () => {
      class MockRuntime implements LobeRuntimeAI {
        chat = vi.fn();
        textToImage = vi.fn();
        models = vi.fn();
        embeddings = vi.fn();
        textToSpeech = vi.fn();
      }

      const dynamicRoutersFunction = (options: any) => [
        {
          apiType: 'openai' as const,
          options: {
            baseURL: `${options.baseURL || 'https://api.openai.com'}/v1`,
          },
          runtime: MockRuntime as any,
          models: ['gpt-4'],
        },
        {
          apiType: 'anthropic' as const,
          options: {
            baseURL: `${options.baseURL || 'https://api.anthropic.com'}/v1`,
          },
          runtime: MockRuntime as any,
          models: ['claude-3'],
        },
      ];

      const Runtime = createRouterRuntime({
        id: 'test-runtime',
        routers: dynamicRoutersFunction,
      });

      const userOptions = {
        apiKey: 'test-key',
        baseURL: 'https://yourapi.cn',
      };

      const runtime = new Runtime(userOptions);

      expect(runtime).toBeDefined();
      expect(runtime['_runtimes']).toHaveLength(2);
      expect(runtime['_runtimes'][0].id).toBe('openai');
      expect(runtime['_runtimes'][1].id).toBe('anthropic');
    });

    it('should throw error when dynamic routers function returns empty array', () => {
      const emptyRoutersFunction = () => [];

      expect(() => {
        const Runtime = createRouterRuntime({
          id: 'test-runtime',
          routers: emptyRoutersFunction,
        });
        new Runtime();
      }).toThrow('empty providers');
    });
  });
});
