import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { SWRConfig } from 'swr';
import { describe, expect, it, vi } from 'vitest';

import { useClientDataSWR } from './index';

const TestWrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(SWRConfig, { value: { provider: () => new Map() } }, children);

describe('SWR Deduplication', () => {
  it('should deduplicate simultaneous requests with same key', async () => {
    const fetcher = vi.fn(async (key: string) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      return `data-${key}`;
    });

    // Render both hooks within the same SWR provider context
    const { result } = renderHook(
      () => {
        const hook1 = useClientDataSWR('test-key', () => fetcher('test-key'));
        const hook2 = useClientDataSWR('test-key', () => fetcher('test-key'));
        return { hook1, hook2 };
      },
      {
        wrapper: TestWrapper,
      },
    );

    // Wait for both to finish loading
    await waitFor(
      () => {
        expect(result.current.hook1.isLoading).toBe(false);
        expect(result.current.hook2.isLoading).toBe(false);
      },
      { timeout: 3000 },
    );

    // Both should have the same data
    expect(result.current.hook1.data).toBe('data-test-key');
    expect(result.current.hook2.data).toBe('data-test-key');

    // Fetcher should only be called once due to deduplication
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should deduplicate requests with same object key', async () => {
    const fetcher = vi.fn(async (params: any) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { items: ['item1', 'item2'] };
    });

    const params = {
      category: undefined,
      knowledgeBaseId: 'kb-123',
      parentId: null,
      showFilesInKnowledgeBase: false,
    };

    // Render both hooks within the same SWR provider context (simulating FileTree and FileExplorer)
    const { result } = renderHook(
      () => {
        const hook1 = useClientDataSWR(['useFetchKnowledgeItems', params], () => fetcher(params));
        const hook2 = useClientDataSWR(['useFetchKnowledgeItems', params], () => fetcher(params));
        return { hook1, hook2 };
      },
      {
        wrapper: TestWrapper,
      },
    );

    // Wait for both to finish loading
    await waitFor(
      () => {
        expect(result.current.hook1.isLoading).toBe(false);
        expect(result.current.hook2.isLoading).toBe(false);
      },
      { timeout: 3000 },
    );

    // Both should have the same data
    expect(result.current.hook1.data).toEqual({ items: ['item1', 'item2'] });
    expect(result.current.hook2.data).toEqual({ items: ['item1', 'item2'] });

    // Fetcher should only be called once due to deduplication
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should make separate requests after deduplication interval', async () => {
    const fetcher = vi.fn(async (key: string) => {
      return `data-${key}`;
    });

    // First request
    const { result: result1, unmount: unmount1 } = renderHook(() =>
      useClientDataSWR('test-key-2', () => fetcher('test-key-2')),
    );

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    expect(fetcher).toHaveBeenCalledTimes(1);

    // Unmount first hook
    unmount1();

    // Wait for deduplication interval to pass (2000ms)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2100));
    });

    // Second request after deduplication interval
    const { result: result2 } = renderHook(() =>
      useClientDataSWR('test-key-2', () => fetcher('test-key-2')),
    );

    await waitFor(() => {
      expect(result2.current.isLoading).toBe(false);
    });

    // Should make a new request after deduplication interval
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
