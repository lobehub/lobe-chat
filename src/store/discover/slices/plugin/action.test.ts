import { renderHook } from '@testing-library/react';
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

describe('PluginAction', () => {
  describe('usePluginCategories', () => {
    it('should fetch plugin categories with correct parameters', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Category 1' },
        { id: 'cat-2', name: 'Category 2' },
      ];

      vi.spyOn(discoverService, 'getPluginCategories').mockResolvedValue(mockCategories as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      // Mock useSWR to call fetcher and return its result
      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        const data = fetcher?.(); // Call fetcher and get its Promise
        return { data, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = {} as any;
      const { result } = renderHook(() => useStore.getState().usePluginCategories(params));

      expect(discoverService.getPluginCategories).toHaveBeenCalledWith(params);

      // Wait for the Promise to resolve
      const resolvedData = await result.current.data;
      expect(resolvedData).toEqual(mockCategories);
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
      renderHook(() => useStore.getState().usePluginCategories(params));

      expect(capturedKey).toBe('plugin-categories-zh-CN');
    });

    it('should not revalidate on focus', () => {
      const useSWRMock = vi.mocked(useSWR);
      let capturedOptions: any = null;
      useSWRMock.mockImplementation(((key: string, fetcher: any, options: any) => {
        capturedOptions = options;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() => useStore.getState().usePluginCategories({}));

      expect(capturedOptions).toEqual({ revalidateOnFocus: false });
    });
  });

  describe('usePluginDetail', () => {
    it('should fetch plugin detail when identifier is provided', async () => {
      const mockDetail = {
        identifier: 'test-plugin',
        name: 'Test Plugin',
        description: 'A test plugin',
      };

      vi.spyOn(discoverService, 'getPluginDetail').mockResolvedValue(mockDetail as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        const data = fetcher?.();
        return { data, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = { identifier: 'test-plugin', withManifest: true };
      const { result } = renderHook(() => useStore.getState().usePluginDetail(params));

      expect(discoverService.getPluginDetail).toHaveBeenCalledWith(params);

      const resolvedData = await result.current.data;
      expect(resolvedData).toEqual(mockDetail);
    });

    it('should not fetch when identifier is undefined', () => {
      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string | null) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() => useStore.getState().usePluginDetail({ identifier: undefined }));

      expect(capturedKey).toBeNull();
    });

    it('should include withManifest in SWR key', () => {
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() =>
        useStore.getState().usePluginDetail({
          identifier: 'test-plugin',
          withManifest: true,
        }),
      );

      expect(capturedKey).toBe('plugin-details-en-US-test-plugin-true');
    });

    it('should not include withManifest in key when false', () => {
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() =>
        useStore.getState().usePluginDetail({
          identifier: 'test-plugin',
          withManifest: false,
        }),
      );

      expect(capturedKey).toBe('plugin-details-en-US-test-plugin');
    });
  });

  describe('usePluginIdentifiers', () => {
    it('should fetch plugin identifiers', async () => {
      const mockIdentifiers = [
        { identifier: 'plugin-1', lastModified: '2024-01-01' },
        { identifier: 'plugin-2', lastModified: '2024-01-02' },
      ];

      vi.spyOn(discoverService, 'getPluginIdentifiers').mockResolvedValue(mockIdentifiers);

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        const data = fetcher?.();
        return { data, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const { result } = renderHook(() => useStore.getState().usePluginIdentifiers());

      expect(discoverService.getPluginIdentifiers).toHaveBeenCalled();

      const resolvedData = await result.current.data;
      expect(resolvedData).toEqual(mockIdentifiers);
    });

    it('should use correct SWR key', () => {
      const useSWRMock = vi.mocked(useSWR);
      let capturedKey: string | null = null;
      useSWRMock.mockImplementation(((key: string) => {
        capturedKey = key;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() => useStore.getState().usePluginIdentifiers());

      expect(capturedKey).toBe('plugin-identifiers');
    });

    it('should not revalidate on focus', () => {
      const useSWRMock = vi.mocked(useSWR);
      let capturedOptions: any = null;
      useSWRMock.mockImplementation(((key: string, fetcher: any, options: any) => {
        capturedOptions = options;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() => useStore.getState().usePluginIdentifiers());

      expect(capturedOptions).toEqual({ revalidateOnFocus: false });
    });
  });

  describe('usePluginList', () => {
    it('should fetch plugin list with default parameters', async () => {
      const mockList = {
        items: [{ identifier: 'plugin-1' }, { identifier: 'plugin-2' }],
        total: 2,
      };

      vi.spyOn(discoverService, 'getPluginList').mockResolvedValue(mockList as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        const data = fetcher?.();
        return { data, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const { result } = renderHook(() => useStore.getState().usePluginList());

      expect(discoverService.getPluginList).toHaveBeenCalledWith({
        page: 1,
        pageSize: 21,
      });

      const resolvedData = await result.current.data;
      expect(resolvedData).toEqual(mockList);
    });

    it('should fetch plugin list with custom parameters', async () => {
      const mockList = {
        items: [{ identifier: 'plugin-1' }],
        total: 1,
      };

      vi.spyOn(discoverService, 'getPluginList').mockResolvedValue(mockList as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('zh-CN');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        const data = fetcher();
        return { data, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = { page: 2, pageSize: 10, category: 'development' } as any;
      const { result } = renderHook(() => useStore.getState().usePluginList(params));

      expect(discoverService.getPluginList).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        category: 'development',
      });

      const resolvedData = await result.current.data;
      expect(resolvedData).toEqual(mockList);
    });

    it('should convert page and pageSize to numbers', async () => {
      vi.spyOn(discoverService, 'getPluginList').mockResolvedValue({ items: [] } as any);
      vi.spyOn(globalHelpers, 'getCurrentLanguage').mockReturnValue('en-US');

      const useSWRMock = vi.mocked(useSWR);
      useSWRMock.mockImplementation(((key: string, fetcher: any) => {
        const data = fetcher();
        return { data, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      const params = { page: 3, pageSize: 15 } as any;
      renderHook(() => useStore.getState().usePluginList(params));

      expect(discoverService.getPluginList).toHaveBeenCalledWith({
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
      renderHook(() => useStore.getState().usePluginList(params));

      expect(capturedKey).toBe('plugin-list-en-US-2-tools');
    });

    it('should not revalidate on focus', () => {
      const useSWRMock = vi.mocked(useSWR);
      let capturedOptions: any = null;
      useSWRMock.mockImplementation(((key: string, fetcher: any, options: any) => {
        capturedOptions = options;
        return { data: undefined, error: undefined, isValidating: false, mutate: vi.fn() };
      }) as any);

      renderHook(() => useStore.getState().usePluginList());

      expect(capturedOptions).toEqual({ revalidateOnFocus: false });
    });
  });
});
