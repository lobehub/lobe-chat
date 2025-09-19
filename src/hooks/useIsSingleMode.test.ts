import { renderHook } from '@testing-library/react';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { useIsSingleMode } from './useIsSingleMode';

// Mock next/navigation
const mockUseSearchParams = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: mockUseSearchParams,
}));

describe('useIsSingleMode', () => {

  it('should return false initially (during SSR)', () => {
    const mockSearchParams = {
      get: vi.fn(() => 'single'),
    } as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useIsSingleMode());

    // Should return false initially before hydration
    expect(result.current).toBe(false);
  });

  it('should return true when mode=single after hydration', async () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => (key === 'mode' ? 'single' : null)),
    } as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result, rerender } = renderHook(() => useIsSingleMode());

    // Initially false
    expect(result.current).toBe(false);

    // Simulate component re-render after mount
    await new Promise(resolve => setTimeout(resolve, 0));
    rerender();

    // After hydration, should detect single mode
    expect(result.current).toBe(true);
  });

  it('should return false when mode is not single', async () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => (key === 'mode' ? 'normal' : null)),
    } as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result, rerender } = renderHook(() => useIsSingleMode());

    // Initially false
    expect(result.current).toBe(false);

    // Simulate component re-render after mount
    await new Promise(resolve => setTimeout(resolve, 0));
    rerender();

    // Should remain false for non-single mode
    expect(result.current).toBe(false);
  });

  it('should return false when no mode parameter exists', async () => {
    const mockSearchParams = {
      get: vi.fn(() => null),
    } as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result, rerender } = renderHook(() => useIsSingleMode());

    // Initially false
    expect(result.current).toBe(false);

    // Simulate component re-render after mount
    await new Promise(resolve => setTimeout(resolve, 0));
    rerender();

    // Should remain false when no mode parameter
    expect(result.current).toBe(false);
  });
});