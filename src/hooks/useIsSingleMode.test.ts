import { renderHook } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { useIsSingleMode } from './useIsSingleMode';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

const mockUseSearchParams = useSearchParams as any;

describe('useIsSingleMode', () => {
  it('should return true when mode is single', () => {
    const mockSearchParams = {
      get: vi.fn().mockReturnValue('single'),
    };

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useIsSingleMode());

    expect(result.current).toBe(true);
    expect(mockSearchParams.get).toHaveBeenCalledWith('mode');
  });

  it('should return false when mode is not single', () => {
    const mockSearchParams = {
      get: vi.fn().mockReturnValue('normal'),
    };

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useIsSingleMode());

    expect(result.current).toBe(false);
    expect(mockSearchParams.get).toHaveBeenCalledWith('mode');
  });

  it('should return false when mode parameter is not present', () => {
    const mockSearchParams = {
      get: vi.fn().mockReturnValue(null),
    };

    mockUseSearchParams.mockReturnValue(mockSearchParams);

    const { result } = renderHook(() => useIsSingleMode());

    expect(result.current).toBe(false);
    expect(mockSearchParams.get).toHaveBeenCalledWith('mode');
  });
});