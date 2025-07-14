// @vitest-environment node
import OpenAI from 'openai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 引入模块以便于对函数进行spy
import { ChatStreamCallbacks } from '@/libs/model-runtime';
import * as openai from '@/libs/model-runtime/openai';

import * as debugStreamModule from '../utils/debugStream';
import officalOpenAIModels from './fixtures/openai-models.json';
import { LobeOpenAI } from './index';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock fetch for most tests, but will be restored for convertImageUrlToFile tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

const convertImageUrlToFileSpy = vi.spyOn(openai, 'convertImageUrlToFile');

describe('LobeOpenAI', () => {
  let instance: InstanceType<typeof LobeOpenAI>;

  // Create mock params for createImage tests - only gpt-image-1 supported params
  const mockParams = {
    prompt: 'test prompt',
    imageUrls: [] as string[],
    size: '1024x1024' as const,
  };

  beforeEach(() => {
    instance = new LobeOpenAI({ apiKey: 'test' });

    // 使用 vi.spyOn 来模拟 chat.completions.create 方法
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
    vi.spyOn(instance['client'].models, 'list').mockResolvedValue({ data: [] } as any);

    // Mock responses.create for responses API tests
    vi.spyOn(instance['client'].responses, 'create').mockResolvedValue(new ReadableStream() as any);

    // Mock convertImageUrlToFile to return a mock File object
    convertImageUrlToFileSpy.mockResolvedValue({
      name: 'image.png',
      type: 'image/png',
      size: 1024,
    } as any);

    // Mock fetch response for most tests
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      headers: {
        get: (header: string) => {
          if (header === 'content-type') {
            return 'image/png';
          }
          return null;
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('chat', () => {
    it('should return a StreamingTextResponse on successful API call', async () => {
      // Arrange
      const mockStream = new ReadableStream();
      const mockResponse = Promise.resolve(mockStream);

      (instance['client'].chat.completions.create as Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await instance.chat({
        messages: [{ content: 'Hello', role: 'user' }],
        model: 'text-davinci-003',
        temperature: 0,
      });

      // Assert
      expect(result).toBeInstanceOf(Response);
    });

    describe('Error', () => {
      it('should return ProviderBizError with an openai error response when OpenAI.APIError is thrown', async () => {
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
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.openai.com/v1',
            error: {
              error: { message: 'Bad Request' },
              status: 400,
            },
            errorType: 'ProviderBizError',
            provider: 'openai',
          });
        }
      });

      it('should throw AgentRuntimeError with NoOpenAIAPIKey if no apiKey is provided', async () => {
        try {
          new LobeOpenAI({});
        } catch (e) {
          expect(e).toEqual({ errorType: 'InvalidProviderAPIKey' });
        }
      });

      it('should return ProviderBizError with the cause when OpenAI.APIError is thrown with cause', async () => {
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
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.openai.com/v1',
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: 'ProviderBizError',
            provider: 'openai',
          });
        }
      });

      it('should return ProviderBizError with an cause response with desensitize Url', async () => {
        // Arrange
        const errorInfo = {
          stack: 'abc',
          cause: { message: 'api is undefined' },
        };
        const apiError = new OpenAI.APIError(400, errorInfo, 'module error', {});

        instance = new LobeOpenAI({
          apiKey: 'test',

          baseURL: 'https://api.abc.com/v1',
        });

        vi.spyOn(instance['client'].chat.completions, 'create').mockRejectedValue(apiError);

        // Act
        try {
          await instance.chat({
            messages: [{ content: 'Hello', role: 'user' }],
            model: 'gpt-3.5-turbo',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.***.com/v1',
            error: {
              cause: { message: 'api is undefined' },
              stack: 'abc',
            },
            errorType: 'ProviderBizError',
            provider: 'openai',
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
            model: 'text-davinci-003',
            temperature: 0,
          });
        } catch (e) {
          expect(e).toEqual({
            endpoint: 'https://api.openai.com/v1',
            errorType: 'AgentRuntimeError',
            provider: 'openai',
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

    describe('DEBUG', () => {
      it('should call debugStream and return StreamingTextResponse when DEBUG_OPENAI_CHAT_COMPLETION is 1', async () => {
        // Arrange
        const mockProdStream = new ReadableStream() as any; // 模拟的 prod 流
        const mockDebugStream = new ReadableStream({
          start(controller) {
            controller.enqueue('Debug stream content');
            controller.close();
          },
        }) as any;
        mockDebugStream.toReadableStream = () => mockDebugStream; // 添加 toReadableStream 方法

        // 模拟 chat.completions.create 返回值，包括模拟的 tee 方法
        (instance['client'].chat.completions.create as Mock).mockResolvedValue({
          tee: () => [mockProdStream, { toReadableStream: () => mockDebugStream }],
        });

        // 保存原始环境变量值
        const originalDebugValue = process.env.DEBUG_OPENAI_CHAT_COMPLETION;

        // 模拟环境变量
        process.env.DEBUG_OPENAI_CHAT_COMPLETION = '1';
        vi.spyOn(debugStreamModule, 'debugStream').mockImplementation(() => Promise.resolve());

        // 执行测试
        // 运行你的测试函数，确保它会在条件满足时调用 debugStream
        // 假设的测试函数调用，你可能需要根据实际情况调整
        await instance.chat({
          messages: [{ content: 'Hello', role: 'user' }],
          model: 'text-davinci-003',
          temperature: 0,
        });

        // 验证 debugStream 被调用
        expect(debugStreamModule.debugStream).toHaveBeenCalled();

        // 恢复原始环境变量值
        process.env.DEBUG_OPENAI_CHAT_COMPLETION = originalDebugValue;
      });
    });
  });

  describe('models', () => {
    it('should get models', async () => {
      // mock the models.list method
      (instance['client'].models.list as Mock).mockResolvedValue({ data: officalOpenAIModels });

      const list = await instance.models();

      expect(list).toMatchSnapshot();
    });
  });

  describe('createImage', () => {
    it('should generate an image with gpt-image-1', async () => {
      // Arrange
      const mockResponse = { data: [{ b64_json: 'test-base64-string' }] };
      const generateSpy = vi
        .spyOn(instance['client'].images, 'generate')
        .mockResolvedValue(mockResponse as any);

      // Act
      const result = await instance.createImage({
        model: 'gpt-image-1',
        params: {
          ...mockParams,
          prompt: 'A cute cat',
          size: '1024x1024',
        },
      });

      // Assert
      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-image-1',
          prompt: 'A cute cat',
          n: 1,
          size: '1024x1024',
        }),
      );
      expect(result.imageUrl).toBe('data:image/png;base64,test-base64-string');
    });

    it('should edit an image from a URL', async () => {
      // Arrange
      const mockResponse = { data: [{ b64_json: 'edited-base64-string' }] };
      const editSpy = vi
        .spyOn(instance['client'].images, 'edit')
        .mockResolvedValue(mockResponse as any);

      // Temporarily restore the spy to use real implementation
      convertImageUrlToFileSpy.mockRestore();

      const imageUrl = 'https://lobehub.com/_next/static/media/logo.98482105.png';

      // Act
      const result = await instance.createImage({
        model: 'gpt-image-1',
        params: {
          ...mockParams,
          prompt: 'A cat in a hat',
          imageUrls: [imageUrl],
        },
      });

      // Assert
      expect(editSpy).toHaveBeenCalled();
      const callArg = editSpy.mock.calls[0][0];
      expect(callArg.model).toBe('gpt-image-1');
      expect(callArg.prompt).toBe('A cat in a hat');
      expect(result.imageUrl).toBe('data:image/png;base64,edited-base64-string');

      // Restore the spy for other tests
      convertImageUrlToFileSpy.mockResolvedValue({
        name: 'image.png',
        type: 'image/png',
        size: 1024,
      } as any);
    });

    it('should handle `size` set to `auto`', async () => {
      // Arrange
      const mockResponse = { data: [{ b64_json: 'test-base64-string' }] };
      const generateSpy = vi
        .spyOn(instance['client'].images, 'generate')
        .mockResolvedValue(mockResponse as any);

      // Act
      await instance.createImage({
        model: 'gpt-image-1',
        params: {
          ...mockParams,
          prompt: 'A cute cat',
          size: 'auto',
        },
      });

      // Assert
      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-image-1',
          prompt: 'A cute cat',
          n: 1,
        }),
      );
      // Should not include size when it's 'auto'
      expect(generateSpy.mock.calls[0][0]).not.toHaveProperty('size');
    });

    it('should throw an error if convertImageUrlToFile fails', async () => {
      // Arrange
      const imageUrl = 'https://example.com/test-image.png';

      // Mock fetch to fail for the image URL, which will cause convertImageUrlToFile to fail
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      // Mock the OpenAI API methods to ensure they don't get called
      const generateSpy = vi.spyOn(instance['client'].images, 'generate');
      const editSpy = vi.spyOn(instance['client'].images, 'edit');

      // Act & Assert - Note: imageUrls must be non-empty array to trigger isImageEdit = true
      await expect(
        instance.createImage({
          model: 'gpt-image-1',
          params: {
            prompt: 'A cat in a hat',
            imageUrls: [imageUrl], // This is the key - non-empty array
          },
        }),
      ).rejects.toThrow('Failed to convert image URLs to File objects: Error: Network error');

      // Verify that OpenAI API methods were not called since conversion failed
      expect(generateSpy).not.toHaveBeenCalled();
      expect(editSpy).not.toHaveBeenCalled();
    });

    it('should throw an error when image response is missing data array', async () => {
      // Arrange
      const mockInvalidResponse = {}; // missing data property
      vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockInvalidResponse as any);

      // Act & Assert
      await expect(
        instance.createImage({
          model: 'gpt-image-1',
          params: { ...mockParams, prompt: 'A cute cat' },
        }),
      ).rejects.toThrow('Invalid image response: missing or empty data array');
    });

    it('should throw an error when image response data array is empty', async () => {
      // Arrange
      const mockInvalidResponse = { data: [] }; // empty data array
      vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockInvalidResponse as any);

      // Act & Assert
      await expect(
        instance.createImage({
          model: 'gpt-image-1',
          params: { ...mockParams, prompt: 'A cute cat' },
        }),
      ).rejects.toThrow('Invalid image response: missing or empty data array');
    });

    it('should throw an error when first data item is null', async () => {
      // Arrange
      const mockInvalidResponse = { data: [null] }; // first item is null
      vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockInvalidResponse as any);

      // Act & Assert
      await expect(
        instance.createImage({
          model: 'gpt-image-1',
          params: { ...mockParams, prompt: 'A cute cat' },
        }),
      ).rejects.toThrow('Invalid image response: first data item is null or undefined');
    });

    it('should throw an error when first data item is undefined', async () => {
      // Arrange
      const mockInvalidResponse = { data: [undefined] }; // first item is undefined
      vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockInvalidResponse as any);

      // Act & Assert
      await expect(
        instance.createImage({
          model: 'gpt-image-1',
          params: { ...mockParams, prompt: 'A cute cat' },
        }),
      ).rejects.toThrow('Invalid image response: first data item is null or undefined');
    });

    it('should re-throw OpenAI API errors during image generation', async () => {
      // Arrange
      const apiError = new OpenAI.APIError(
        400,
        { error: { message: 'Bad Request' } },
        'Error message',
        {},
      );
      vi.spyOn(instance['client'].images, 'generate').mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        instance.createImage({
          model: 'gpt-image-1',
          params: { ...mockParams, prompt: 'A cute cat' },
        }),
      ).rejects.toThrow(apiError);
    });

    it('should throw an error for invalid image response', async () => {
      // Arrange
      const mockInvalidResponse = { data: [{ url: 'some_url' }] }; // missing b64_json
      vi.spyOn(instance['client'].images, 'generate').mockResolvedValue(mockInvalidResponse as any);

      // Act & Assert
      await expect(
        instance.createImage({
          model: 'gpt-image-1',
          params: { ...mockParams, prompt: 'A cute cat' },
        }),
      ).rejects.toThrow('Invalid image response: missing b64_json field');
    });
  });

  describe('convertImageUrlToFile', () => {
    beforeEach(() => {
      // Reset the spy to use the real implementation for these tests
      convertImageUrlToFileSpy.mockRestore();
    });

    afterEach(() => {
      // Restore the spy for other tests
      convertImageUrlToFileSpy.mockResolvedValue({
        name: 'image.png',
        type: 'image/png',
        size: 1024,
      } as any);
    });

    it('should convert the real lobehub logo URL to a FileLike object', async () => {
      const imageUrl = 'https://lobehub.com/_next/static/media/logo.98482105.png';
      const file = await openai.convertImageUrlToFile(imageUrl);

      expect(file).toBeDefined();
      expect((file as any).name).toBe('image.png');
      expect((file as any).type).toMatch(/^image\//);
      expect((file as any).size).toBeGreaterThan(0);
    });

    it('should convert a base64 data URL to a FileLike object', async () => {
      const dataUrl =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AN//Z';
      const file = await openai.convertImageUrlToFile(dataUrl);

      expect(file).toBeDefined();
      expect((file as any).name).toBe('image.jpeg');
      expect((file as any).type).toBe('image/jpeg');
    });

    it('should handle different image mime types from data URL', async () => {
      const webpDataUrl = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
      const file = await openai.convertImageUrlToFile(webpDataUrl);

      expect(file).toBeDefined();
      expect((file as any).name).toBe('image.webp');
      expect((file as any).type).toBe('image/webp');
    });
  });

  // Separate describe block for mocked fetch scenarios
  describe('convertImageUrlToFile - mocked scenarios', () => {
    beforeEach(() => {
      // Reset the spy to use the real implementation
      convertImageUrlToFileSpy.mockRestore();
    });

    afterEach(() => {
      // Restore the spy for other tests
      convertImageUrlToFileSpy.mockResolvedValue({
        name: 'image.png',
        type: 'image/png',
        size: 1024,
      } as any);
    });

    it('should throw an error if fetching an image from a URL fails', async () => {
      // Use vi.mocked for type-safe mocking
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as any);

      const imageUrl = 'https://example.com/invalid-image.png';

      await expect(openai.convertImageUrlToFile(imageUrl)).rejects.toThrow(
        'Failed to fetch image from https://example.com/invalid-image.png: Not Found',
      );
    });

    it('should use a default mime type of image/png if content-type header is not available', async () => {
      // Use vi.mocked for type-safe mocking
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
        headers: {
          get: () => null,
        },
      } as any);

      const imageUrl = 'https://example.com/image-no-content-type';
      const file = await openai.convertImageUrlToFile(imageUrl);

      expect(file).toBeDefined();
      expect((file as any).type).toBe('image/png');
    });
  });

  describe('responses.handlePayload', () => {
    it('should add web_search_preview tool when enabledSearch is true', async () => {
      const payload = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'gpt-4o', // 使用常规模型，通过 enabledSearch 触发 responses API
        temperature: 0.7,
        enabledSearch: true,
        tools: [{ type: 'function' as const, function: { name: 'test', description: 'test' } }],
      };

      await instance.chat(payload);

      const createCall = (instance['client'].responses.create as Mock).mock.calls[0][0];
      expect(createCall.tools).toEqual([
        { type: 'function', name: 'test', description: 'test' },
        { type: 'web_search_preview' },
      ]);
    });

    it('should handle computer-use models with truncation and reasoning', async () => {
      const payload = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'computer-use-preview',
        temperature: 0.7,
        reasoning: { effort: 'medium' },
      };

      await instance.chat(payload);

      const createCall = (instance['client'].responses.create as Mock).mock.calls[0][0];
      expect(createCall.truncation).toBe('auto');
      expect(createCall.reasoning).toEqual({ effort: 'medium', summary: 'auto' });
    });

    it('should handle prunePrefixes models without computer-use truncation', async () => {
      const payload = {
        messages: [{ content: 'Hello', role: 'user' as const }],
        model: 'o1-pro', // prunePrefixes 模型但非 computer-use
        temperature: 0.7,
      };

      await instance.chat(payload);

      const createCall = (instance['client'].responses.create as Mock).mock.calls[0][0];
      expect(createCall.reasoning).toEqual({ summary: 'auto' });
      expect(createCall.truncation).toBeUndefined();
    });
  });
});
