import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PRESENCE_REFRESH_INTERVAL_MS, useBoundDevice } from '../useBoundDevice';

const useDeviceList = vi.fn();

vi.mock('@/features/DeviceManager/useDeviceList', () => ({
  useDeviceList: (...args: unknown[]) => useDeviceList(...args),
}));

describe('useBoundDevice', () => {
  beforeEach(() => {
    useDeviceList.mockReset().mockReturnValue({
      data: [{ deviceId: 'dev-1' }, { deviceId: 'dev-2' }],
    });
  });

  it('polls device presence while the Overview is on screen', () => {
    renderHook(() => useBoundDevice('dev-1', true));

    expect(useDeviceList).toHaveBeenCalledWith({ refreshInterval: PRESENCE_REFRESH_INTERVAL_MS });
  });

  it('stops polling device presence while the Overview is hidden', () => {
    renderHook(() => useBoundDevice('dev-1', false));

    expect(useDeviceList).toHaveBeenCalledWith({ refreshInterval: 0 });
  });

  it('resolves the bound device from the list', () => {
    const { result } = renderHook(() => useBoundDevice('dev-2', true));

    expect(result.current).toEqual({ deviceId: 'dev-2' });
  });

  it('returns undefined when the device is not in the list', () => {
    const { result } = renderHook(() => useBoundDevice('gone', true));

    expect(result.current).toBeUndefined();
  });
});
