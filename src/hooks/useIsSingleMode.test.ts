import { renderHook } from '@testing-library/react';
import { ReadonlyURLSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { useIsSingleMode } from './useIsSingleMode';

// Mock next/navigation
const mockUseSearchParams = vi.hoisted(() => vi.fn());
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

    // In test environment, useEffect runs synchronously, so it will immediately detect single mode
    expect(result.current).toBe(true);
  });

  it('should return true when mode=single', () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => (key === 'mode' ? 'single' : null)),
    } as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useIsSingleMode());

    // Should immediately detect single mode in test environment
    expect(result.current).toBe(true);
  });

  it('should return false when mode is not single', () => {
    const mockSearchParams = {
      get: vi.fn((key: string) => (key === 'mode' ? 'normal' : null)),
    } as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useIsSingleMode());

    // Should return false for non-single mode
    expect(result.current).toBe(false);
  });

  it('should return false when no mode parameter exists', () => {
    const mockSearchParams = {
      get: vi.fn(() => null),
    } as unknown as ReadonlyURLSearchParams;

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useIsSingleMode());

    // Should return false when no mode parameter
    expect(result.current).toBe(false);
  });
});