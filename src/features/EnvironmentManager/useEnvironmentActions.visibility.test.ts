import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environmentService } from '@/services/environment';

import { useEnvironmentActions } from './useEnvironmentData';

const swr = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock('@/libs/swr', () => ({
  useClientDataSWR: () => ({ data: undefined, error: undefined, mutate: swr.mutate }),
}));

vi.mock('@/hooks/useSandboxDriveEntitlement', () => ({
  useSandboxDriveEntitlement: () => ({ entitled: true }),
}));

vi.mock('@/services/environment', () => ({
  environmentService: { setEnvironmentVisibility: vi.fn() },
}));

vi.mock('@/services/sandboxStorage', () => ({ sandboxStorageService: {} }));

describe('useEnvironmentActions.setEnvironmentVisibility', () => {
  beforeEach(() => {
    swr.mutate.mockReset().mockResolvedValue(undefined);
    vi.mocked(environmentService.setEnvironmentVisibility).mockResolvedValue({} as any);
  });

  it('should re-read the instance rows, whose rebuild state follows the visibility', async () => {
    const { result } = renderHook(() => useEnvironmentActions());

    await act(async () => {
      await result.current.setEnvironmentVisibility({ id: 'env-1', visibility: 'private' });
    });

    expect(environmentService.setEnvironmentVisibility).toHaveBeenCalledWith({
      id: 'env-1',
      visibility: 'private',
    });
    // The rows and their sizes, both read again.
    expect(swr.mutate).toHaveBeenCalled();
  });
});
