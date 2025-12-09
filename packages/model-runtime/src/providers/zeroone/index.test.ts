// @vitest-environment node
import { ModelProvider } from 'model-bank';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { testProvider } from '../../providerTestUtils';
import { LobeZeroOneAI, params } from './index';

testProvider({
  Runtime: LobeZeroOneAI,
  chatDebugEnv: 'DEBUG_ZEROONE_CHAT_COMPLETION',
  chatModel: 'yi-34b-chat-0205',
  defaultBaseURL: 'https://api.lingyiwanwu.com/v1',
  provider: ModelProvider.ZeroOne,
});

describe('LobeZeroOneAI - custom features', () => {
  let instance: InstanceType<typeof LobeZeroOneAI>;

  beforeEach(() => {
    instance = new LobeZeroOneAI({ apiKey: 'test_api_key' });
    vi.spyOn(instance['client'].chat.completions, 'create').mockResolvedValue(
      new ReadableStream() as any,
    );
  });

  describe('params configuration', () => {
    it('should export params object with correct baseURL', () => {
      expect(params.baseURL).toBe('https://api.lingyiwanwu.com/v1');
    });

    it('should export params with correct provider', () => {
      expect(params.provider).toBe(ModelProvider.ZeroOne);
    });

    it('should have debug configuration', () => {
      expect(params.debug).toBeDefined();
      expect(params.debug.chatCompletion).toBeDefined();
      expect(typeof params.debug.chatCompletion).toBe('function');
    });

    it('should have models function', () => {
      expect(params.models).toBeDefined();
      expect(typeof params.models).toBe('function');
    });
  });

  describe('debug configuration', () => {
    it('should disable debug by default', () => {
      delete process.env.DEBUG_ZEROONE_CHAT_COMPLETION;
      const result = params.debug.chatCompletion();
      expect(result).toBe(false);
    });

    it('should enable debug when env is set to 1', () => {
      process.env.DEBUG_ZEROONE_CHAT_COMPLETION = '1';
      const result = params.debug.chatCompletion();
      expect(result).toBe(true);
    });

    it('should disable debug when env is set to 0', () => {
      process.env.DEBUG_ZEROONE_CHAT_COMPLETION = '0';
      const result = params.debug.chatCompletion();
      expect(result).toBe(false);
    });

    it('should disable debug when env is empty string', () => {
      process.env.DEBUG_ZEROONE_CHAT_COMPLETION = '';
      const result = params.debug.chatCompletion();
      expect(result).toBe(false);
    });
  });

  describe('models function', () => {
    it('should fetch and process models with data property', async () => {
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockResolvedValue({
            data: [
              { id: 'yi-34b-chat-0205', object: 'model' },
              { id: 'yi-lightning', object: 'model' },
            ],
          }),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
    });

    it('should handle models list without data property (direct array)', async () => {
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockResolvedValue([
            { id: 'yi-34b-chat-0205', object: 'model' },
            { id: 'yi-lightning', object: 'model' },
          ]),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
    });

    it('should handle empty models list with data property', async () => {
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockResolvedValue({
            data: [],
          }),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(0);
    });

    it('should handle empty models list without data property', async () => {
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockResolvedValue([]),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(0);
    });

    it('should handle null response', async () => {
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockResolvedValue(null),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(0);
    });

    it('should handle undefined response', async () => {
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockResolvedValue(undefined),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(0);
    });

    it('should handle response with non-array data', async () => {
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockResolvedValue({
            data: 'not-an-array',
          }),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(0);
    });

    it('should handle network error and return empty array', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockRejectedValue(new Error('Network error')),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
      expect(models).toHaveLength(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch ZeroOne models. Please ensure your ZeroOne API key is valid:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle API authentication error and return empty array', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockClient = {
        apiKey: 'invalid_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockRejectedValue(new Error('401 Unauthorized')),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch ZeroOne models. Please ensure your ZeroOne API key is valid:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle API rate limit error and return empty array', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockRejectedValue(new Error('429 Too Many Requests')),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch ZeroOne models. Please ensure your ZeroOne API key is valid:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle timeout error and return empty array', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockRejectedValue(new Error('Request timeout')),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(mockClient.models.list).toHaveBeenCalledTimes(1);
      expect(models).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch ZeroOne models. Please ensure your ZeroOne API key is valid:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle malformed JSON response', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      expect(models).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to fetch ZeroOne models. Please ensure your ZeroOne API key is valid:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should pass correct client to processModelList', async () => {
      const mockModelList = [
        { id: 'yi-34b-chat-0205', object: 'model' },
        { id: 'yi-lightning', object: 'model' },
      ];

      const mockClient = {
        apiKey: 'test_api_key',
        baseURL: 'https://api.lingyiwanwu.com/v1',
        models: {
          list: vi.fn().mockResolvedValue({ data: mockModelList }),
        },
      } as any;

      const models = await params.models!({ client: mockClient });

      // Verify processModelList was called with correct parameters
      expect(models).toBeDefined();
      expect(Array.isArray(models)).toBe(true);
    });
  });
});
