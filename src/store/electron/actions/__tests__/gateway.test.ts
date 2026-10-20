import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useElectronStore } from '@/store/electron';

const service = vi.hoisted(() => ({ getDeviceInfo: vi.fn(), getStableDeviceId: vi.fn() }));

vi.mock('@lobechat/const', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  isDesktop: true,
}));

vi.mock('@/services/electron/gatewayConnection', () => ({ gatewayConnectionService: service }));

beforeEach(() => {
  service.getDeviceInfo.mockReset();
  service.getStableDeviceId.mockReset();
  useElectronStore.setState({ gatewayDeviceInfo: undefined });
});

describe('resolveGatewayDeviceId', () => {
  // Regression: a cwd write that ran before any picker mounted read an empty
  // store and saved the path with no machine.
  it('asks the desktop for its stable id when the store has not loaded one', async () => {
    service.getStableDeviceId.mockResolvedValue('stable-1');

    await expect(useElectronStore.getState().resolveGatewayDeviceId()).resolves.toBe('stable-1');
  });

  // Regression: before the gateway connects the store holds the install's
  // fallback UUID, which no longer names this machine once the identity is derived.
  it('ignores a cached fallback id and never takes the network-backed device info path', async () => {
    useElectronStore.setState({
      gatewayDeviceInfo: { deviceId: 'fallback-uuid', hostname: 'mac', platform: 'darwin' },
    });
    service.getStableDeviceId.mockResolvedValue('stable-1');

    await expect(useElectronStore.getState().resolveGatewayDeviceId()).resolves.toBe('stable-1');
    expect(service.getDeviceInfo).not.toHaveBeenCalled();
    // The renderer's "this device" must agree with the pin just written, or the
    // next turn reads this desktop as a remote machine.
    expect(useElectronStore.getState().gatewayDeviceInfo?.deviceId).toBe('stable-1');
  });

  it('returns nothing while signed out or when the desktop cannot answer', async () => {
    service.getStableDeviceId.mockResolvedValueOnce(undefined);
    await expect(useElectronStore.getState().resolveGatewayDeviceId()).resolves.toBeUndefined();

    service.getStableDeviceId.mockRejectedValueOnce(new Error('ipc down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(useElectronStore.getState().resolveGatewayDeviceId()).resolves.toBeUndefined();
  });
});
