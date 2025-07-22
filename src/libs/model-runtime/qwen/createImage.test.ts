// @vitest-environment edge-runtime
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreateImagePayload } from '../types/image';
import { CreateImageOptions } from '../utils/openaiCompatibleFactory';
import { createQwenImage } from './createImage';

// Mock the console.error to avoid polluting test output
vi.spyOn(console, 'error').mockImplementation(() => {});

const mockOptions: CreateImageOptions = {
  apiKey: 'test-api-key',
  provider: 'qwen',
};

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('createQwenImage', () => {
  describe('Success scenarios', () => {
    it('should successfully generate image with immediate success', async () => {
      const mockTaskId = 'task-123456';
      const mockImageUrl = 'https://dashscope.oss-cn-beijing.aliyuncs.com/aigc/test-image.jpg';

      // Mock fetch for task creation and immediate success
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: { task_id: mockTaskId },
            request_id: 'req-123',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: {
              task_id: mockTaskId,
              task_status: 'SUCCEEDED',
              results: [{ url: mockImageUrl }],
            },
            request_id: 'req-124',
          }),
        });

      const payload: CreateImagePayload = {
        model: 'wanx2.1-t2i-turbo',
        params: {
          prompt: 'A beautiful sunset over the mountains',
        },
      };

      const result = await createQwenImage(payload, mockOptions);

      // Verify task creation request
      expect(fetch).toHaveBeenCalledWith(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable',
          },
          body: JSON.stringify({
            input: {
              prompt: 'A beautiful sunset over the mountains',
            },
            model: 'wanx2.1-t2i-turbo',
            parameters: {
              n: 1,
              size: '1024*1024',
            },
          }),
        },
      );

      // Verify status query request
      expect(fetch).toHaveBeenCalledWith(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${mockTaskId}`,
        {
          headers: {
            Authorization: 'Bearer test-api-key',
          },
        },
      );

      expect(result).toEqual({
        imageUrl: mockImageUrl,
      });
    });

    it('should handle task that needs polling before success', async () => {
      const mockTaskId = 'task-polling';
      const mockImageUrl = 'https://dashscope.oss-cn-beijing.aliyuncs.com/aigc/test-image-3.jpg';

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: { task_id: mockTaskId },
            request_id: 'req-127',
          }),
        })
        // First status query - still running
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: {
              task_id: mockTaskId,
              task_status: 'RUNNING',
            },
            request_id: 'req-128',
          }),
        })
        // Second status query - succeeded
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: {
              task_id: mockTaskId,
              task_status: 'SUCCEEDED',
              results: [{ url: mockImageUrl }],
            },
            request_id: 'req-129',
          }),
        });

      const payload: CreateImagePayload = {
        model: 'wanx2.1-t2i-turbo',
        params: {
          prompt: 'Abstract digital art',
        },
      };

      const result = await createQwenImage(payload, mockOptions);

      // Should have made 3 fetch calls: 1 create + 2 status checks
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        imageUrl: mockImageUrl,
      });
    });

    it('should handle custom image dimensions', async () => {
      const mockTaskId = 'task-custom-size';
      const mockImageUrl = 'https://dashscope.oss-cn-beijing.aliyuncs.com/aigc/custom-size.jpg';

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: { task_id: mockTaskId },
            request_id: 'req-140',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: {
              task_id: mockTaskId,
              task_status: 'SUCCEEDED',
              results: [{ url: mockImageUrl }],
            },
            request_id: 'req-141',
          }),
        });

      const payload: CreateImagePayload = {
        model: 'wanx2.1-t2i-turbo',
        params: {
          prompt: 'Custom size image',
          width: 512,
          height: 768,
        },
      };

      await createQwenImage(payload, mockOptions);

      expect(fetch).toHaveBeenCalledWith(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
        expect.objectContaining({
          body: JSON.stringify({
            input: {
              prompt: 'Custom size image',
            },
            model: 'wanx2.1-t2i-turbo',
            parameters: {
              n: 1,
              size: '512*768',
            },
          }),
        }),
      );
    });

    it('should handle long running tasks with retries', async () => {
      const mockTaskId = 'task-long-running';

      // Mock status query that returns RUNNING a few times then succeeds
      let statusCallCount = 0;
      const statusQueryMock = vi.fn().mockImplementation(() => {
        statusCallCount++;
        if (statusCallCount <= 3) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              output: {
                task_id: mockTaskId,
                task_status: 'RUNNING',
              },
              request_id: `req-${133 + statusCallCount}`,
            }),
          });
        } else {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              output: {
                task_id: mockTaskId,
                task_status: 'SUCCEEDED',
                results: [{ url: 'https://example.com/final-image.jpg' }],
              },
              request_id: 'req-137',
            }),
          });
        }
      });

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: { task_id: mockTaskId },
            request_id: 'req-132',
          }),
        })
        .mockImplementation(statusQueryMock);

      const payload: CreateImagePayload = {
        model: 'wanx2.1-t2i-turbo',
        params: {
          prompt: 'Long running task',
        },
      };

      // Mock setTimeout to make test run faster but still allow controlled execution
      vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        // Use setImmediate to avoid recursion issues
        setImmediate(callback);
        return 1 as any;
      });

      const result = await createQwenImage(payload, mockOptions);

      expect(result).toEqual({
        imageUrl: 'https://example.com/final-image.jpg',
      });

      // Should have made 1 create call + 4 status calls (3 RUNNING + 1 SUCCEEDED)
      expect(fetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error scenarios', () => {
    it('should handle task creation failure', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Invalid model name',
        }),
      });

      const payload: CreateImagePayload = {
        model: 'invalid-model',
        params: {
          prompt: 'Test prompt',
        },
      };

      await expect(createQwenImage(payload, mockOptions)).rejects.toEqual(
        expect.objectContaining({
          errorType: 'ProviderBizError',
          provider: 'qwen',
        }),
      );
    });

    it('should handle task failure status', async () => {
      const mockTaskId = 'task-failed';

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: { task_id: mockTaskId },
            request_id: 'req-130',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: {
              task_id: mockTaskId,
              task_status: 'FAILED',
              error_message: 'Content policy violation',
            },
            request_id: 'req-131',
          }),
        });

      const payload: CreateImagePayload = {
        model: 'wanx2.1-t2i-turbo',
        params: {
          prompt: 'Invalid prompt that causes failure',
        },
      };

      await expect(createQwenImage(payload, mockOptions)).rejects.toEqual(
        expect.objectContaining({
          errorType: 'ProviderBizError',
          provider: 'qwen',
        }),
      );
    });

    it('should handle task succeeded but no results', async () => {
      const mockTaskId = 'task-no-results';

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: { task_id: mockTaskId },
            request_id: 'req-134',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: {
              task_id: mockTaskId,
              task_status: 'SUCCEEDED',
              results: [], // Empty results array
            },
            request_id: 'req-135',
          }),
        });

      const payload: CreateImagePayload = {
        model: 'wanx2.1-t2i-turbo',
        params: {
          prompt: 'Test prompt',
        },
      };

      await expect(createQwenImage(payload, mockOptions)).rejects.toEqual(
        expect.objectContaining({
          errorType: 'ProviderBizError',
          provider: 'qwen',
        }),
      );
    });

    it('should handle status query failure', async () => {
      const mockTaskId = 'task-query-fail';

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            output: { task_id: mockTaskId },
            request_id: 'req-136',
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          statusText: 'Unauthorized',
          json: async () => ({
            message: 'Invalid API key',
          }),
        });

      const payload: CreateImagePayload = {
        model: 'wanx2.1-t2i-turbo',
        params: {
          prompt: 'Test prompt',
        },
      };

      await expect(createQwenImage(payload, mockOptions)).rejects.toEqual(
        expect.objectContaining({
          errorType: 'ProviderBizError',
          provider: 'qwen',
        }),
      );
    });
  });
});
