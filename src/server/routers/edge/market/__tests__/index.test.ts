import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_LANG } from '@/const/locale';
import { AssistantStore } from '@/server/modules/AssistantStore';
import { PluginStore } from '@/server/modules/PluginStore';

import { marketRouter } from '../index';

// Mock AssistantStore
vi.mock('@/server/modules/AssistantStore', () => {
  const getAgentUrl = vi.fn().mockImplementation((id, locale) => `mock-url/${id}/${locale}`);
  const getAgentIndex = vi.fn();
  const getAgentIndexUrl = vi.fn();
  // Helper to allow per-test override
  function createMockAssistantStore(
    overrides: Partial<Record<keyof InstanceType<typeof AssistantStore>, unknown>> = {},
  ) {
    return {
      getAgentUrl,
      getAgentIndex,
      getAgentIndexUrl,
      ...overrides,
    };
  }
  return {
    AssistantStore: vi.fn().mockImplementation(() => createMockAssistantStore()),
    __createMockAssistantStore: createMockAssistantStore,
    __getAgentUrl: getAgentUrl,
    __getAgentIndex: getAgentIndex,
    __getAgentIndexUrl: getAgentIndexUrl,
  };
});

// Mock PluginStore
vi.mock('@/server/modules/PluginStore', () => {
  const getPluginIndexUrl = vi.fn().mockImplementation((locale) => `mock-plugin-url/${locale}`);
  function createMockPluginStore(
    overrides: Partial<Record<keyof InstanceType<typeof PluginStore>, unknown>> = {},
  ) {
    return {
      getPluginIndexUrl,
      ...overrides,
    };
  }
  return {
    PluginStore: vi.fn().mockImplementation(() => createMockPluginStore()),
    __getPluginIndexUrl: getPluginIndexUrl,
  };
});

describe('marketRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('getAgent', () => {
    it('should fetch agent with locale', async () => {
      const mockResponse = { name: 'test agent' };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      global.fetch = mockFetch;

      const caller = marketRouter.createCaller({} as any);
      const result = await caller.getAgent({ id: 'test-id', locale: 'en-US' });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('mock-url/test-id/en-US');
    });

    it('should fallback to default lang if 404', async () => {
      const mockResponse = { name: 'test agent' };
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });
      global.fetch = mockFetch;

      const caller = marketRouter.createCaller({} as any);
      const result = await caller.getAgent({ id: 'test-id', locale: 'fr-FR' });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(`mock-url/test-id/${DEFAULT_LANG}`);
    });

    it('should throw error if fetch fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
      global.fetch = mockFetch;

      const caller = marketRouter.createCaller({} as any);

      await expect(caller.getAgent({ id: 'test-id' })).rejects.toThrow(
        'Failed to fetch agent with id test-id',
      );
    });
  });

  describe('getAgentIndex', () => {
    it('should return agent index', async () => {
      const mockIndex = { agents: [], schemaVersion: 1 };
      // @ts-expect-error: TS error due to private baseUrl, not relevant for test
      vi.mocked(AssistantStore).mockImplementation(() => ({
        getAgentUrl: vi.fn(),
        getAgentIndex: vi.fn().mockResolvedValue(mockIndex),
        getAgentIndexUrl: vi.fn(),
      }));

      const caller = marketRouter.createCaller({} as any);
      const result = await caller.getAgentIndex({ locale: 'en-US' });

      expect(result).toEqual(mockIndex);
    });

    it('should return empty index on fetch failed', async () => {
      // @ts-expect-error: TS error due to private baseUrl, not relevant for test
      vi.mocked(AssistantStore).mockImplementation(() => ({
        getAgentUrl: vi.fn(),
        getAgentIndex: vi.fn().mockRejectedValue(new Error('fetch failed')),
        getAgentIndexUrl: vi.fn(),
      }));

      const caller = marketRouter.createCaller({} as any);
      const result = await caller.getAgentIndex();

      expect(result).toEqual({ agents: [], schemaVersion: 1 });
    });

    it('should throw TRPC error on other errors', async () => {
      // @ts-expect-error: TS error due to private baseUrl, not relevant for test
      vi.mocked(AssistantStore).mockImplementation(() => ({
        getAgentUrl: vi.fn(),
        getAgentIndex: vi.fn().mockRejectedValue(new Error('other error')),
        getAgentIndexUrl: vi.fn(),
      }));

      const caller = marketRouter.createCaller({} as any);

      await expect(caller.getAgentIndex()).rejects.toThrow(TRPCError);
    });
  });

  describe('getPluginIndex', () => {
    it('should fetch plugin index with locale', async () => {
      const mockResponse = [{ name: 'test plugin' }];
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      global.fetch = mockFetch;

      const caller = marketRouter.createCaller({} as any);
      const result = await caller.getPluginIndex({ locale: 'en-US' });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith('mock-plugin-url/en-US');
    });

    it('should fallback to default lang if 404', async () => {
      const mockResponse = [{ name: 'test plugin' }];
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 404 })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });
      global.fetch = mockFetch;

      const caller = marketRouter.createCaller({} as any);
      const result = await caller.getPluginIndex({ locale: 'fr-FR' });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(`mock-plugin-url/${DEFAULT_LANG}`);
    });

    it('should return empty array on fetch failed', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('fetch failed'));
      global.fetch = mockFetch;

      const caller = marketRouter.createCaller({} as any);
      const result = await caller.getPluginIndex();

      expect(result).toEqual([]);
    });

    it('should throw TRPC error on other errors', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('other error'));
      global.fetch = mockFetch;

      const caller = marketRouter.createCaller({} as any);

      await expect(caller.getPluginIndex()).rejects.toThrow(TRPCError);
    });
  });
});
