import { renderHook } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';

import { useQuery } from './useQuery';

// Mocks
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => 'baz=qux&foo=bar'),
}));

describe('useQuery', () => {
  it('should parse query', () => {
    const { result } = renderHook(() => useQuery());
    expect(result.current).toEqual({
      baz: 'qux',
      foo: 'bar',
    });
  });
});
