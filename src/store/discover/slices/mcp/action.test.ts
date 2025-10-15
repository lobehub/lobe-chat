import { act, renderHook } from '@testing-library/react';
import useSWR from 'swr';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { discoverService } from '@/services/discover';
import { globalHelpers } from '@/store/global/helpers';

import { useDiscoverStore as useStore } from '../../store';

vi.mock('zustand/traditional');

// Mock for useSWR
vi.mock('swr', () => ({
  default: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('MCPAction', () => {
  describe('useFetchMcpDetail', () => {
    it('should fetch MCP detail when identifier is provided', async () => {
      const mockDetail = {
        identifier: 'test-mcp',
        name: 'Test MCP',
        description: 'A test MCP server',
      };

      vi.spyOn(discoverService, 'getMcpDetail').mockResolvedValue(mockDetail as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        fetcher?.();
        return { data: mockDetail, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = { identifier: 'test-mcp', version: '1.0.0' };
      const { result } = renderHook(() => useStore.getState().useFetchMcpDetail(params));

      expect(discoverService.getMcpDetail).toHaveBeenCalledWith(params);
      expect(result.current.data).toEqual(mockDetail);
    });

    it('should not fetch when identifier is undefined', () => {
      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string | null) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() => useStore.getState().useFetchMcpDetail({ identifier: undefined }));

      expect(capturedKey).toBeNull();
    });

    it('should include version in SWR key when provided', () => {
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() =>
        useStore.getState().useFetchMcpDetail({
          identifier: 'test-mcp',
          version: '1.0.0',
        }),
      );

      expect(capturedKey).toBe('mcp-detail-en-US-test-mcp-1.0.0');
    });

    it('should not include version in key when not provided', () => {
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('zh-CN');

      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() =>
        useStore.getState().useFetchMcpDetail({
          identifier: 'test-mcp',
        }),
      );

      expect(capturedKey).toBe('mcp-detail-zh-CN-test-mcp');
    });
  });

  describe('useFetchMcpList', () => {
    it('should fetch MCP list with default parameters', async () => {
      const mockList = {
        items: [{ identifier: 'mcp-1' }, { identifier: 'mcp-2' }],
        total: 2,
      };

      vi.spyOn(discoverService, 'getMcpList').mockResolvedValue(mockList as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        fetcher?.();
        return { data: mockList, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const { result } = renderHook(() => useStore.getState().useFetchMcpList({}));

      expect(discoverService.getMcpList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 21,
      });
      expect(result.current.data).toEqual(mockList);
    });

    it('should fetch MCP list with custom parameters', async () => {
      const mockList = {
        items: [{ identifier: 'mcp-1' }],
        total: 1,
      };

      vi.spyOn(discoverService, 'getMcpList').mockResolvedValue(mockList as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('zh-CN');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        const data = fetcher();
        return { data, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = { page: 2, pageSize: 10, category: 'data-analysis' } as any;
      const { result } = renderHook(() => useStore.getState().useFetchMcpList(params));

      await act(async () => {
        await result.current.data;
      });

      expect(discoverService.getMcpList).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        category: 'data-analysis',
      });
    });

    it('should convert page and pageSize to numbers', async () => {
      vi.spyOn(discoverService, 'getMcpList').mockResolvedValue({ items: [] } as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        const data = fetcher();
        return { data, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = { page: 3, pageSize: 15 } as any;
      renderHook(() => useStore.getState().useFetchMcpList(params));

      expect(discoverService.getMcpList).toHaveBeenCalledWith({
        page: 3,
        pageSize: 15,
      });
    });

    it('should use correct SWR key with locale and params', () => {
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = { page: 2, category: 'tools' } as any;
      renderHook(() => useStore.getState().useFetchMcpList(params));

      expect(capturedKey).toBe('mcp-list-en-US-2-tools');
    });
  });

  describe('useMcpCategories', () => {
    it('should fetch MCP categories with correct parameters', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1' },
        { id: 'cat-2', name: 'Category 2' },
      ];

      vi.spyOn(discoverService, 'getMcpCategories').mockResolvedValue(mockCategories as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        fetcher?.();
        return { data: mockCategories, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = {} as any;
      const { result } = renderHook(() => useStore.getState().useMcpCategories(params));

      expect(discoverService.getMcpCategories).toHaveBeenCalledWith(params);
      expect(result.current.data).toEqual(mockCategories);
    });

    it('should use correct SWR key with locale and params', () => {
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('zh-CN');

      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = {} as any;
      renderHook(() => useStore.getState().useMcpCategories(params));

      expect(capturedKey).toBe('mcp-categories-zh-CN');
    });

    it('should have correct SWR configuration', () => {
      const useSWRMock = vi.mocked(useSWR);
      let capturedOptions: any = null;
      useSWRMock.mockImplementation(((key: string, fetcher: any, options: any) => {
        capturedOptions = options;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() => useStore.getState().useMcpCategories({}));

      expect(capturedOptions).toMatchObject({ revalidateOnFocus: false });
    });
  });
});
