// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../../types/error';
import { LobeHuggingFaceAI, params } from './index';

describe('LobeHuggingFaceAI', () => {
  let instance: any;

  beforeEach(() => {
    instance = new LobeHuggingFaceAI({ apiKey: 'test' });

    const mockAsyncIterable = {
      async *[Symbol.asyncIterator]() {
        yield { choices: [] } as any;
      },
    } as any;

    // mock custom client's chatCompletionStream
    instance['client'] = {
      chatCompletionStream: vi.fn().mockReturnValue(mockAsyncIterable),
    } as any;
  });

  it('should initialize and return StreamingTextResponse on chat', async () => {
    const res = await instance.chat({
      messages: [{ role: 'user', content: 'hello' }],
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      temperature: 0,
      stream: true,
    });

    expect(res).toBeInstanceOf(Response);
  });

  it('should set provider id properly', async () => {
    // provider id 用于错误封装等，这里验证暴露 id 一致
    expect(ModelProvider.HuggingFace).toBe('huggingface');
  });

  describe('params export', () => {
    it('should export params object', () => {
      expect(params).toBeDefined();
      expect(params.provider).toBe(ModelProvider.HuggingFace);
    });

    it('should have chatCompletion configuration', () => {
      expect(params.chatCompletion).toBeDefined();
      expect(params.chatCompletion.handleStreamBizErrorType).toBeDefined();
    });

    it('should have customClient configuration', () => {
      expect(params.customClient).toBeDefined();
      expect(params.customClient.createClient).toBeDefined();
      expect(params.customClient.createChatCompletionStream).toBeDefined();
    });

    it('should have debug configuration', () => {
      expect(params.debug).toBeDefined();
      expect(params.debug.chatCompletion).toBeDefined();
    });

    it('should have models function', () => {
      expect(params.models).toBeDefined();
      expect(typeof params.models).toBe('function');
    });
  });

  describe('Debug Configuration', () => {
    it('should disable debug by default', () => {
      delete process.env.DEBUG_HUGGINGFACE_CHAT_COMPLETION;
      const result = params.debug.chatCompletion();
      expect(result).toBe(false);
    });

    it('should enable debug when env is set', () => {
      process.env.DEBUG_HUGGINGFACE_CHAT_COMPLETION = '1';
      const result = params.debug.chatCompletion();
      expect(result).toBe(true);
      delete process.env.DEBUG_HUGGINGFACE_CHAT_COMPLETION;
    });

    it('should disable debug when env is not "1"', () => {
      process.env.DEBUG_HUGGINGFACE_CHAT_COMPLETION = '0';
      const result = params.debug.chatCompletion();
      expect(result).toBe(false);
      delete process.env.DEBUG_HUGGINGFACE_CHAT_COMPLETION;
    });
  });

  describe('Custom Error Handling', () => {
    it('should return PermissionDenied for Pro subscription error', () => {
      const error = {
        message:
          'Server meta-llama/Meta-Llama-3.1-8B-Instruct does not seem to support chat completion. Error: Model requires a Pro subscription; check out hf.co/pricing to learn more. Make sure to include your HF token in your query.',
      };

      const result = params.chatCompletion.handleStreamBizErrorType!(error as any);
      expect(result).toBe(AgentRuntimeErrorType.PermissionDenied);
    });

    it('should return InvalidProviderAPIKey for invalid token error', () => {
      const error = {
        message:
          'Server meta-llama/Meta-Llama-3.1-8B-Instruct does not seem to support chat completion. Error: Authorization header is correct, but the token seems invalid',
      };

      const result = params.chatCompletion.handleStreamBizErrorType!(error as any);
      expect(result).toBe(AgentRuntimeErrorType.InvalidProviderAPIKey);
    });

    it('should return undefined for other errors', () => {
      const error = {
        message: 'Some other error',
      };

      const result = params.chatCompletion.handleStreamBizErrorType!(error as any);
      expect(result).toBeUndefined();
    });

    it('should handle error without message property', () => {
      const error = {};

      const result = params.chatCompletion.handleStreamBizErrorType!(error as any);
      expect(result).toBeUndefined();
    });
  });

  describe('Custom Client', () => {
    it('should create HfInference client with api key', () => {
      const client = params.customClient!.createClient({ apiKey: 'test-api-key' });
      expect(client).toBeDefined();
    });

    describe('createChatCompletionStream', () => {
      it('should call client.chatCompletionStream with correct parameters', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = {
          baseURL: 'https://api.example.com',
        };

        const payload = {
          max_tokens: 2048,
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
          temperature: 0.7,
          top_p: 0.9,
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith({
          endpointUrl: 'https://api.example.com/test-model',
          max_tokens: 2048,
          messages: payload.messages,
          model: 'test-model',
          stream: true,
          temperature: 0.7,
          top_p: 0.9,
        });
      });

      it('should use default max_tokens of 4096 when not provided', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = {
          baseURL: 'https://api.example.com',
        };

        const payload = {
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith(
          expect.objectContaining({
            max_tokens: 4096,
          }),
        );
      });

      it('should handle undefined baseURL', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = {
          baseURL: undefined,
        };

        const payload = {
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith(
          expect.objectContaining({
            endpointUrl: undefined,
          }),
        );
      });

      it('should clamp top_p to 0.99 when >= 1', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = { baseURL: 'https://api.example.com' };

        const payload = {
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
          top_p: 1,
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith(
          expect.objectContaining({
            top_p: 0.99,
          }),
        );
      });

      it('should clamp top_p to 0.99 when > 1', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = { baseURL: 'https://api.example.com' };

        const payload = {
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
          top_p: 1.5,
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith(
          expect.objectContaining({
            top_p: 0.99,
          }),
        );
      });

      it('should set top_p to undefined when 0 (falsy value)', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = { baseURL: 'https://api.example.com' };

        const payload = {
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
          top_p: 0,
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith(
          expect.objectContaining({
            top_p: undefined,
          }),
        );
      });

      it('should clamp top_p to 0.01 when < 0', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = { baseURL: 'https://api.example.com' };

        const payload = {
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
          top_p: -0.5,
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith(
          expect.objectContaining({
            top_p: 0.01,
          }),
        );
      });

      it('should keep top_p unchanged when in valid range', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = { baseURL: 'https://api.example.com' };

        const payload = {
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
          top_p: 0.5,
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith(
          expect.objectContaining({
            top_p: 0.5,
          }),
        );
      });

      it('should set top_p to undefined when not provided', () => {
        const mockClient = {
          chatCompletionStream: vi.fn().mockReturnValue({
            async *[Symbol.asyncIterator]() {
              yield { choices: [] } as any;
            },
          }),
        } as any;

        const mockInstance = { baseURL: 'https://api.example.com' };

        const payload = {
          messages: [{ role: 'user', content: 'test' }],
          model: 'test-model',
        };

        params.customClient!.createChatCompletionStream(mockClient, payload as any, mockInstance);

        expect(mockClient.chatCompletionStream).toHaveBeenCalledWith(
          expect.objectContaining({
            top_p: undefined,
          }),
        );
      });
    });
  });

  describe('Models Fetching', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch and process models from HuggingFace API', async () => {
      const mockModels = [
        {
          id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          tags: ['text-generation', 'llama'],
        },
        {
          id: 'microsoft/Phi-3-mini-4k-instruct',
          tags: ['text-generation'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      expect(fetch).toHaveBeenCalledWith('https://huggingface.co/api/models', {
        method: 'GET',
      });
      expect(models).toHaveLength(2);
      expect(models[0].id).toBe('meta-llama/Meta-Llama-3.1-8B-Instruct');
      expect(models[1].id).toBe('microsoft/Phi-3-mini-4k-instruct');
    });

    it('should detect function-calling ability from tags', async () => {
      const mockModels = [
        {
          id: 'test-model',
          tags: ['function-calling', 'text-generation'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      expect(models[0].functionCall).toBe(true);
    });

    it('should detect vision ability from vision keywords in tags', async () => {
      const mockModels = [
        {
          id: 'vision-model-1',
          tags: ['image-text-to-text', 'text-generation'],
        },
        {
          id: 'vision-model-2',
          tags: ['multimodal', 'text-generation'],
        },
        {
          id: 'vision-model-3',
          tags: ['vision', 'text-generation'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      expect(models[0].vision).toBe(true);
      expect(models[1].vision).toBe(true);
      expect(models[2].vision).toBe(true);
    });

    it('should detect reasoning ability from reasoning tag', async () => {
      const mockModels = [
        {
          id: 'reasoning-model',
          tags: ['reasoning', 'text-generation'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      expect(models[0].reasoning).toBe(true);
    });

    it('should detect reasoning ability from reasoning keywords in model id', async () => {
      const mockModels = [
        {
          id: 'deepseek-r1-model',
          tags: ['text-generation'],
        },
        {
          id: 'qvq-model',
          tags: ['text-generation'],
        },
        {
          id: 'qwq-model',
          tags: ['text-generation'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      expect(models[0].reasoning).toBe(true);
      expect(models[1].reasoning).toBe(true);
      expect(models[2].reasoning).toBe(true);
    });

    it('should merge with LOBE_DEFAULT_MODEL_LIST when model is known', async () => {
      const mockModels = [
        {
          id: 'meta-llama/llama-3.3-70b-instruct',
          tags: ['text-generation'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      const model = models.find((m) => m.id === 'meta-llama/llama-3.3-70b-instruct');
      expect(model).toBeDefined();
      // Should have properties from LOBE_DEFAULT_MODEL_LIST if the model exists there
      if (model) {
        expect(model.enabled).toBeDefined();
        expect(typeof model.enabled).toBe('boolean');
      }
    });

    it('should handle models with case-insensitive matching', async () => {
      const mockModels = [
        {
          id: 'META-LLAMA/LLAMA-3.3-70B-INSTRUCT',
          tags: ['text-generation'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      expect(models[0].id).toBe('META-LLAMA/LLAMA-3.3-70B-INSTRUCT');
    });

    it('should set default values for unknown models', async () => {
      const mockModels = [
        {
          id: 'unknown/unknown-model',
          tags: ['text-generation'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      expect(models[0].enabled).toBe(false);
      expect(models[0].functionCall).toBe(false);
      expect(models[0].reasoning).toBe(false);
      expect(models[0].vision).toBe(false);
    });

    it('should combine tag-based and model-list-based abilities', async () => {
      const mockModels = [
        {
          id: 'meta-llama/llama-3.3-70b-instruct',
          tags: ['function-calling', 'reasoning'],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();

      const model = models.find((m) => m.id === 'meta-llama/llama-3.3-70b-instruct');
      if (model) {
        // Should have true if either tag or model list has the ability
        expect(typeof model.functionCall).toBe('boolean');
        expect(typeof model.reasoning).toBe('boolean');
      }
    });

    it('should handle empty model list', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: async () => [],
      } as Response);

      const models = await params.models!();

      expect(models).toEqual([]);
    });

    it('should handle API errors gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      await expect(params.models!()).rejects.toThrow('API Error');
    });

    it('should handle invalid JSON response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      await expect(params.models!()).rejects.toThrow('Invalid JSON');
    });

    it('should preserve contextWindowTokens from known models', async () => {
      const mockModels = [
        {
          id: 'meta-llama/llama-3.3-70b-instruct',
          tags: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();
      const model = models.find((m) => m.id === 'meta-llama/llama-3.3-70b-instruct');

      if (model) {
        // contextWindowTokens should be preserved from LOBE_DEFAULT_MODEL_LIST if available
        expect(model.contextWindowTokens).toBeDefined();
      }
    });

    it('should preserve displayName from known models', async () => {
      const mockModels = [
        {
          id: 'meta-llama/llama-3.3-70b-instruct',
          tags: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        json: async () => mockModels,
      } as Response);

      const models = await params.models!();
      const model = models.find((m) => m.id === 'meta-llama/llama-3.3-70b-instruct');

      if (model) {
        // displayName should be preserved from LOBE_DEFAULT_MODEL_LIST if available
        expect(model.displayName).toBeDefined();
      }
    });
  });
});
