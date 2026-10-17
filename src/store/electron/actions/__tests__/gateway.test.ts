import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useElectronStore } from '@/store/electron';

const getDeviceInfo = vi.hoisted(() => vi.fn());

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  isDesktop: true,
}));

vi.mock('@/services/electron/gatewayConnection', () => ({
  gatewayConnectionService: { getDeviceInfo },
}));

beforeEach(() => {
  getDeviceInfo.mockReset();
  useElectronStore.setState({ gatewayDeviceInfo: undefined });
});

describe('resolveGatewayDeviceId', () => {
  // Regression: a cwd write that ran before any picker mounted read an empty
  // store and saved the path with no machine.
  it('asks the desktop for its id when the store has not loaded it yet', async () => {
    getDeviceInfo.mockResolvedValue({ deviceId: 'dev-1', hostname: 'mac', platform: 'darwin' });

    await expect(useElectronStore.getState().resolveGatewayDeviceId()).resolves.toBe('dev-1');
    expect(useElectronStore.getState().gatewayDeviceInfo?.deviceId).toBe('dev-1');
  });

  it('reuses the loaded id without another IPC call', async () => {
    useElectronStore.setState({
      gatewayDeviceInfo: { deviceId: 'dev-2', hostname: 'mac', platform: 'darwin' },
    });

    await expect(useElectronStore.getState().resolveGatewayDeviceId()).resolves.toBe('dev-2');
    expect(getDeviceInfo).not.toHaveBeenCalled();
  });

  it('returns nothing when the desktop cannot report an id', async () => {
    getDeviceInfo.mockRejectedValue(new Error('ipc down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(useElectronStore.getState().resolveGatewayDeviceId()).resolves.toBeUndefined();
  });
});
