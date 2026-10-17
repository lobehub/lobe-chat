import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useEnvironmentRefresh } from './useEnvironmentRefresh';

const actions = () => ({
  environments: vi.fn().mockResolvedValue({ environments: [{ id: 'kept' }] }),
  instances: vi.fn().mockResolvedValue({ instances: [{ id: 'kept-copy' }] }),
  usage: vi.fn().mockResolvedValue({ usageBytes: 290_500 }),
});

afterEach(() => vi.restoreAllMocks());

describe('manual environment refresh', () => {
  it('surfaces failed measurement without rejecting, then clears the failure after recovery', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const requests = actions();
    requests.usage.mockRejectedValueOnce(new Error('measurement unavailable'));
    const { result } = renderHook(() => useEnvironmentRefresh(requests));
    await act(async () => {
      await expect(result.current.refresh()).resolves.toBeUndefined();
    });
    expect(result.current.usageError).toBe(true);
    expect(result.current.refreshing).toBe(false);
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.usageError).toBe(false);
  });

  it('does not mislabel list failure as a measurement failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const requests = actions();
    requests.instances.mockRejectedValueOnce(new Error('instances unavailable'));
    const { result } = renderHook(() => useEnvironmentRefresh(requests));
    await act(async () => {
      await expect(result.current.refresh()).resolves.toBeUndefined();
    });
    expect(result.current.usageError).toBe(false);
  });

  it('keeps refresh busy until slower requests settle after a measurement failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const requests = actions();
    let finish!: () => void;
    requests.environments.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
    );
    requests.usage.mockRejectedValueOnce(new Error('measurement unavailable'));
    const { result } = renderHook(() => useEnvironmentRefresh(requests));
    let pending!: Promise<void>;
    await act(async () => {
      pending = result.current.refresh();
      void pending.catch(() => {});
    });
    expect(result.current.refreshing).toBe(true);
    await act(async () => {
      finish();
      await pending.catch(() => {});
    });
    expect(result.current.refreshing).toBe(false);
    expect(result.current.usageError).toBe(true);
  });

  it('accepts a successful null result for an account without storage', async () => {
    const requests = actions();
    requests.usage.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useEnvironmentRefresh(requests));
    await act(async () => {
      await result.current.refresh();
    });
    expect(result.current.usageError).toBe(false);
  });
});
