// @vitest-environment node
import { Langfuse } from 'langfuse';
import { LangfuseGenerationClient, LangfuseTraceClient } from 'langfuse-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as langfuseCfg from '@/config/langfuse';
import { JWTPayload } from '@/const/auth';
import { TraceNameMap } from '@/const/trace';
import { AgentRuntime, ChatStreamPayload, LobeOpenAI, ModelProvider } from '@/libs/model-runtime';
import { providerRuntimeMap } from '@/libs/model-runtime/runtimeMap';
import { CreateImagePayload } from '@/libs/model-runtime/types/image';
import { createTraceOptions } from '@/server/modules/AgentRuntime';

import { AgentChatOptions } from './ModelRuntime';

const specialProviders = [
  { id: 'openai', payload: { apiKey: 'user-openai-key', baseURL: 'user-endpoint' } },
  {
    id: ModelProvider.Azure,
    payload: {
      apiKey: 'user-azure-key',
      baseURL: 'user-azure-endpoint',
      apiVersion: '2024-06-01',
    },
  },
  {
    id: ModelProvider.AzureAI,
    payload: {
      apiKey: 'user-azure-key',
      baseURL: 'user-azure-endpoint',
    },
  },
  {
    id: ModelProvider.Bedrock,
    payload: {
      accessKeyId: 'user-aws-id',
      accessKeySecret: 'user-aws-secret',
      region: 'user-aws-region',
    },
  },
  {
    id: ModelProvider.Ollama,
    payload: { baseURL: 'https://user-ollama-url' },
  },
  {
    id: ModelProvider.Cloudflare,
    payload: { baseURLOrAccountID: 'https://user-ollama-url' },
  },
];

const testRuntime = (providerId: string, payload?: any) => {
  describe(`${providerId} provider runtime`, () => {
    it('should initialize correctly', async () => {
      const jwtPayload: JWTPayload = { apiKey: 'user-key', ...payload };
      const runtime = await AgentRuntime.initializeWithProvider(providerId, jwtPayload);

      // @ts-ignore
      expect(runtime['_runtime']).toBeInstanceOf(providerRuntimeMap[providerId]);

      if (payload?.baseURL) {
        expect(runtime['_runtime'].baseURL).toBe(payload.baseURL);
      }
    });
  });
};

let mockModelRuntime: AgentRuntime;
beforeEach(async () => {
  const jwtPayload: JWTPayload = { apiKey: 'user-openai-key', baseURL: 'user-endpoint' };
  mockModelRuntime = await AgentRuntime.initializeWithProvider(ModelProvider.OpenAI, jwtPayload);
});

describe('AgentRuntime', () => {
  describe('should initialize with various providers', () => {
    const providers = Object.values(ModelProvider);

    const specialProviderIds = [ModelProvider.VertexAI, ...specialProviders.map((p) => p.id)];

    const generalTestProviders = providers.filter(
      (provider) => !specialProviderIds.includes(provider),
    );

    generalTestProviders.forEach((provider) => {
      testRuntime(provider);
    });

    specialProviders.forEach(({ id, payload }) => testRuntime(id, payload));
  });

  describe('AgentRuntime chat method', () => {
    it('should run correctly', async () => {
      const payload: ChatStreamPayload = {
        messages: [{ role: 'user', content: 'Hello, world!' }],
        model: 'text-davinci-002',
        temperature: 0,
      };

      vi.spyOn(LobeOpenAI.prototype, 'chat').mockResolvedValue(new Response(''));

      await mockModelRuntime.chat(payload);
    });
    it('should handle options correctly', async () => {
      const payload: ChatStreamPayload = {
        messages: [{ role: 'user', content: 'Hello, world!' }],
        model: 'text-davinci-002',
        temperature: 0,
      };

      const options: AgentChatOptions = {
        provider: 'openai',
        trace: {
          traceId: 'test-trace-id',
          traceName: TraceNameMap.SummaryTopicTitle,
          sessionId: 'test-session-id',
          topicId: 'test-topic-id',
          tags: [],
          userId: 'test-user-id',
        },
      };

      vi.spyOn(LobeOpenAI.prototype, 'chat').mockResolvedValue(new Response(''));

      await mockModelRuntime.chat(payload, createTraceOptions(payload, options));
    });

    describe('callback', async () => {
      const payload: ChatStreamPayload = {
        messages: [{ role: 'user', content: 'Hello, world!' }],
        model: 'text-davinci-002',
        temperature: 0,
      };

      const options: AgentChatOptions = {
        provider: 'openai',
        trace: {
          traceId: 'test-trace-id',
          traceName: TraceNameMap.SummaryTopicTitle,
          sessionId: 'test-session-id',
          topicId: 'test-topic-id',
          tags: [],
          userId: 'test-user-id',
        },
        enableTrace: true,
      };

      const updateMock = vi.fn();

      it('should call onToolsCalling correctly', async () => {
        vi.spyOn(langfuseCfg, 'getLangfuseConfig').mockReturnValue({
          ENABLE_LANGFUSE: true,
          LANGFUSE_PUBLIC_KEY: 'abc',
          LANGFUSE_SECRET_KEY: 'DDD',
        } as any);

        // 使用 spyOn 模拟 chat 方法
        vi.spyOn(LobeOpenAI.prototype, 'chat').mockImplementation(
          async (payload, { callback }: any) => {
            // 模拟 onToolCall 回调的触发
            if (callback?.onToolsCalling) {
              await callback.onToolsCalling();
            }
            return new Response('abc');
          },
        );
        vi.spyOn(LangfuseTraceClient.prototype, 'update').mockImplementation(updateMock);

        await mockModelRuntime.chat(payload, createTraceOptions(payload, options));

        expect(updateMock).toHaveBeenCalledWith({ tags: ['Tools Calling'] });
      });
      it('should call onStart correctly', async () => {
        vi.spyOn(langfuseCfg, 'getLangfuseConfig').mockReturnValue({
          ENABLE_LANGFUSE: true,
          LANGFUSE_PUBLIC_KEY: 'abc',
          LANGFUSE_SECRET_KEY: 'DDD',
        } as any);

        vi.spyOn(LangfuseGenerationClient.prototype, 'update').mockImplementation(updateMock);
        vi.spyOn(LobeOpenAI.prototype, 'chat').mockImplementation(
          async (payload, { callback }: any) => {
            if (callback?.onStart) {
              callback.onStart();
            }
            return new Response('Success');
          },
        );

        await mockModelRuntime.chat(payload, createTraceOptions(payload, options));

        // Verify onStart was called
        expect(updateMock).toHaveBeenCalledWith({ completionStartTime: expect.any(Date) });
      });

      it('should call onCompletion correctly', async () => {
        vi.spyOn(langfuseCfg, 'getLangfuseConfig').mockReturnValue({
          ENABLE_LANGFUSE: true,
          LANGFUSE_PUBLIC_KEY: 'abc',
          LANGFUSE_SECRET_KEY: 'DDD',
        } as any);
        // Spy on the chat method and trigger onCompletion callback
        vi.spyOn(LangfuseGenerationClient.prototype, 'update').mockImplementation(updateMock);
        vi.spyOn(LobeOpenAI.prototype, 'chat').mockImplementation(
          async (payload, { callback }: any) => {
            if (callback?.onCompletion) {
              await callback.onCompletion({ text: 'Test completion' });
            }
            return new Response('Success');
          },
        );

        await mockModelRuntime.chat(payload, createTraceOptions(payload, options));

        // Verify onCompletion was called with expected output
        expect(updateMock).toHaveBeenCalledWith({
          endTime: expect.any(Date),
          metadata: {},
          output: 'Test completion',
        });
      });
      it.skip('should call onFinal correctly', async () => {
        vi.spyOn(langfuseCfg, 'getLangfuseConfig').mockReturnValue({
          ENABLE_LANGFUSE: true,
          LANGFUSE_PUBLIC_KEY: 'abc',
          LANGFUSE_SECRET_KEY: 'DDD',
        } as any);

        vi.spyOn(LobeOpenAI.prototype, 'chat').mockImplementation(
          async (payload, { callback }: any) => {
            if (callback?.onFinal) {
              await callback.onFinal('Test completion');
            }
            return new Response('Success');
          },
        );
        const shutdownAsyncMock = vi.fn();
        vi.spyOn(Langfuse.prototype, 'shutdownAsync').mockImplementation(shutdownAsyncMock);

        await mockModelRuntime.chat(payload, createTraceOptions(payload, options));

        // Verify onCompletion was called with expected output
        expect(shutdownAsyncMock).toHaveBeenCalled();
      });
    });
  });

  describe('AgentRuntime createImage method', () => {
    it('should run correctly with basic parameters', async () => {
      const payload: CreateImagePayload = {
        model: 'dall-e-3',
        params: {
          prompt: 'A beautiful sunset over mountains',
          width: 1024,
          height: 1024,
        },
      };

      const mockResponse = {
        imageUrl: 'https://example.com/image.jpg',
        width: 1024,
        height: 1024,
      };

      vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

      const result = await mockModelRuntime.createImage(payload);

      expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
      expect(result).toBe(mockResponse);
    });

    it('should handle gpt-image-1 model correctly', async () => {
      const payload: CreateImagePayload = {
        model: 'gpt-image-1',
        params: {
          prompt: 'A cute cat playing in the garden',
          size: '1024x1024',
        },
      };

      const mockResponse = {
        imageUrl:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      };

      vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

      const result = await mockModelRuntime.createImage(payload);

      expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
      expect(result).toBe(mockResponse);
    });

    it('should handle image editing with imageUrls parameter', async () => {
      const payload: CreateImagePayload = {
        model: 'gpt-image-1',
        params: {
          prompt: 'Add a hat to this cat',
          imageUrls: ['https://example.com/cat.jpg'],
          size: '1024x1024',
        },
      };

      const mockResponse = {
        imageUrl: 'data:image/png;base64,edited-image-base64-string',
      };

      vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

      const result = await mockModelRuntime.createImage(payload);

      expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
      expect(result).toBe(mockResponse);
    });

    it('should handle size parameter set to "auto"', async () => {
      const payload: CreateImagePayload = {
        model: 'gpt-image-1',
        params: {
          prompt: 'A landscape photo',
          size: 'auto',
        },
      };

      const mockResponse = {
        imageUrl: 'data:image/png;base64,auto-sized-image-base64-string',
      };

      vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

      const result = await mockModelRuntime.createImage(payload);

      expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
      expect(result).toBe(mockResponse);
    });

    it('should handle different image dimensions', async () => {
      const payload: CreateImagePayload = {
        model: 'dall-e-3',
        params: {
          prompt: 'A portrait of a person',
          width: 512,
          height: 768,
        },
      };

      const mockResponse = {
        imageUrl: 'https://example.com/portrait.jpg',
        width: 512,
        height: 768,
      };

      vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

      const result = await mockModelRuntime.createImage(payload);

      expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
      expect(result).toBe(mockResponse);
    });

    it('should handle data URL image inputs', async () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

      const payload: CreateImagePayload = {
        model: 'gpt-image-1',
        params: {
          prompt: 'Edit this image',
          imageUrls: [dataUrl],
        },
      };

      const mockResponse = {
        imageUrl: 'data:image/png;base64,processed-image-base64-string',
      };

      vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

      const result = await mockModelRuntime.createImage(payload);

      expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
      expect(result).toBe(mockResponse);
    });

    describe('Error handling', () => {
      it('should handle provider errors gracefully', async () => {
        const payload: CreateImagePayload = {
          model: 'dall-e-3',
          params: {
            prompt: 'A test image',
            width: 1024,
            height: 1024,
          },
        };

        const providerError = new Error('Provider API error');
        vi.spyOn(LobeOpenAI.prototype, 'createImage').mockRejectedValue(providerError);

        await expect(mockModelRuntime.createImage(payload)).rejects.toThrow('Provider API error');
        expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
      });

      it('should handle network errors', async () => {
        const payload: CreateImagePayload = {
          model: 'gpt-image-1',
          params: {
            prompt: 'A network test image',
            imageUrls: ['https://example.com/image.jpg'],
          },
        };

        const networkError = new Error('Network connection failed');
        vi.spyOn(LobeOpenAI.prototype, 'createImage').mockRejectedValue(networkError);

        await expect(mockModelRuntime.createImage(payload)).rejects.toThrow(
          'Network connection failed',
        );
      });

      it('should handle invalid model errors', async () => {
        const payload: CreateImagePayload = {
          model: 'invalid-model',
          params: {
            prompt: 'A test image',
          },
        };

        const modelError = new Error('Invalid model specified');
        vi.spyOn(LobeOpenAI.prototype, 'createImage').mockRejectedValue(modelError);

        await expect(mockModelRuntime.createImage(payload)).rejects.toThrow(
          'Invalid model specified',
        );
      });

      it('should handle API rate limit errors', async () => {
        const payload: CreateImagePayload = {
          model: 'dall-e-3',
          params: {
            prompt: 'A rate limit test image',
            width: 1024,
            height: 1024,
          },
        };

        const rateLimitError = new Error('Rate limit exceeded');
        vi.spyOn(LobeOpenAI.prototype, 'createImage').mockRejectedValue(rateLimitError);

        await expect(mockModelRuntime.createImage(payload)).rejects.toThrow('Rate limit exceeded');
      });
    });

    describe('Edge cases', () => {
      it('should handle undefined createImage method gracefully', async () => {
        const payload: CreateImagePayload = {
          model: 'dall-e-3',
          params: {
            prompt: 'A beautiful sunset over mountains',
            width: 1024,
            height: 1024,
          },
        };

        // Mock runtime without createImage method
        const runtimeWithoutCreateImage = {
          createImage: undefined,
        };

        // @ts-ignore - testing edge case
        mockModelRuntime['_runtime'] = runtimeWithoutCreateImage;

        const result = await mockModelRuntime.createImage(payload);

        expect(result).toBeUndefined();
      });

      it('should handle empty prompt', async () => {
        const payload: CreateImagePayload = {
          model: 'dall-e-3',
          params: {
            prompt: '',
            width: 1024,
            height: 1024,
          },
        };

        const mockResponse = {
          imageUrl: 'https://example.com/empty-prompt-image.jpg',
          width: 1024,
          height: 1024,
        };

        vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

        const result = await mockModelRuntime.createImage(payload);

        expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
        expect(result).toBe(mockResponse);
      });

      it('should handle multiple image URLs', async () => {
        const payload: CreateImagePayload = {
          model: 'gpt-image-1',
          params: {
            prompt: 'Combine these images',
            imageUrls: [
              'https://example.com/image1.jpg',
              'https://example.com/image2.jpg',
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            ],
          },
        };

        const mockResponse = {
          imageUrl: 'data:image/png;base64,combined-image-base64-string',
        };

        vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

        const result = await mockModelRuntime.createImage(payload);

        expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
        expect(result).toBe(mockResponse);
      });

      it('should handle very long prompts', async () => {
        const longPrompt =
          'A'.repeat(1000) + ' very detailed image description that exceeds normal length limits';

        const payload: CreateImagePayload = {
          model: 'dall-e-3',
          params: {
            prompt: longPrompt,
            width: 1024,
            height: 1024,
          },
        };

        const mockResponse = {
          imageUrl: 'https://example.com/long-prompt-image.jpg',
          width: 1024,
          height: 1024,
        };

        vi.spyOn(LobeOpenAI.prototype, 'createImage').mockResolvedValue(mockResponse);

        const result = await mockModelRuntime.createImage(payload);

        expect(LobeOpenAI.prototype.createImage).toHaveBeenCalledWith(payload);
        expect(result).toBe(mockResponse);
      });
    });

    describe('Different providers', () => {
      it('should work with different model providers that support image generation', async () => {
        // Test with a hypothetical different provider
        const jwtPayload: JWTPayload = { apiKey: 'fal-key' };
        const falRuntime = await AgentRuntime.initializeWithProvider('fal', jwtPayload);

        const payload: CreateImagePayload = {
          model: 'fal-ai/flux-general',
          params: {
            prompt: 'A futuristic cityscape',
            width: 1024,
            height: 1024,
          },
        };

        const mockResponse = {
          imageUrl: 'https://example.com/fal-image.jpg',
          width: 1024,
          height: 1024,
        };

        // @ts-ignore - mock the fal runtime's createImage method
        vi.spyOn(falRuntime['_runtime'], 'createImage').mockResolvedValue(mockResponse);

        const result = await falRuntime.createImage(payload);

        expect(result).toBe(mockResponse);
      });
    });
  });

  describe('AgentRuntime models method', () => {
    it('should run correctly', async () => {
      const mockModels = [
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      ];

      vi.spyOn(LobeOpenAI.prototype, 'models').mockResolvedValue(mockModels);

      const result = await mockModelRuntime.models();

      expect(LobeOpenAI.prototype.models).toHaveBeenCalled();
      expect(result).toBe(mockModels);
    });

    it('should handle undefined models method gracefully', async () => {
      // Mock runtime without models method
      const runtimeWithoutModels = {
        models: undefined,
      };

      // @ts-ignore - testing edge case
      mockModelRuntime['_runtime'] = runtimeWithoutModels;

      const result = await mockModelRuntime.models();

      expect(result).toBeUndefined();
    });
  });
});
