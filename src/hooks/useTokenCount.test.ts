import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as tokenizers from '@/utils/tokenizer';

import { useTokenCount } from './useTokenCount';

describe('useTokenCount', () => {
  it('should return token count for given input', async () => {
    const { result } = renderHook(() => useTokenCount('test input'));

    expect(result.current).toBe(0);
    await waitFor(() => expect(result.current).toBe(2));
  });

  it('should fall back to input length if encodeAsync throws', async () => {
    const mockEncodeAsync = vi.spyOn(tokenizers, 'encodeAsync');
    mockEncodeAsync.mockRejectedValueOnce(new Error('encode error'));

    const { result } = renderHook(() => useTokenCount('test input'));

    expect(result.current).toBe(0);
    await waitFor(() => expect(result.current).toBe(10)); // Updated to reflect the length of 'test input'
  });

  it('should handle empty input', async () => {
    const { result } = renderHook(() => useTokenCount(''));

    expect(result.current).toBe(0);
    await waitFor(() => expect(result.current).toBe(0));
  });

  it('should handle null input', async () => {
    const { result } = renderHook(() => useTokenCount(null as any));

    expect(result.current).toBe(0);
    await waitFor(() => expect(result.current).toBe(0));
  });

  // Additional test to verify the hook's response to changes in its dependencies
  it('should update token count when input changes', async () => {
    const { result, rerender } = renderHook(({ input }) => useTokenCount(input), {
      initialProps: { input: 'initial input' },
    });

    expect(result.current).toBe(0);
    await waitFor(() => expect(result.current).toBe(2)); // Assuming 'initial input' results in 2 tokens

    rerender({ input: 'updated input' });
    await waitFor(() => expect(result.current).toBe(3)); // Assuming 'updated input' results in 3 tokens
  });
});
