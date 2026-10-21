import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveDispatchTimeout } from './deviceTimeout';

const mocks = vi.hoisted(() => ({ readDeviceSystemInfo: vi.fn() }));

vi.mock('@/server/services/deviceGateway', () => ({
  deviceGateway: { readDeviceSystemInfo: mocks.readDeviceSystemInfo },
}));

const target = { deviceId: 'dev-1', userId: 'user-1', workspaceId: 'ws-1' };
const timeout = (extra: Record<string, unknown> = {}) =>
  JSON.stringify({ error: 'TIMEOUT', success: false, ...extra });

beforeEach(() => {
  mocks.readDeviceSystemInfo.mockReset();
  mocks.readDeviceSystemInfo.mockResolvedValue({ ok: true, systemInfo: {} });
});

describe('resolveDispatchTimeout', () => {
  it('leaves every other dispatch failure alone without probing', async () => {
    for (const raw of [
      undefined,
      'DEVICE_OFFLINE',
      '{"error":"DEVICE_NOT_FOUND"}',
      'spawn failed',
    ]) {
      expect(await resolveDispatchTimeout(raw, target)).toBe(raw);
    }
    expect(mocks.readDeviceSystemInfo).not.toHaveBeenCalled();
  });

  it('reads a timeout on a socket that missed its heartbeats as offline', async () => {
    expect(await resolveDispatchTimeout(timeout({ timeSinceHeartbeatMs: 70_000 }), target)).toBe(
      'DEVICE_OFFLINE',
    );
    expect(mocks.readDeviceSystemInfo).not.toHaveBeenCalled();
  });

  it.each(['DEVICE_OFFLINE', 'DEVICE_NOT_FOUND'])(
    'reads a timeout as offline when the probe answers %s',
    async (reason) => {
      mocks.readDeviceSystemInfo.mockResolvedValueOnce({ ok: false, reason });

      expect(await resolveDispatchTimeout(timeout({ timeSinceHeartbeatMs: 5_000 }), target)).toBe(
        'DEVICE_OFFLINE',
      );
      expect(mocks.readDeviceSystemInfo).toHaveBeenCalledWith('user-1', 'dev-1', 'ws-1');
    },
  );

  it.each([
    ['the device answers', { ok: true, systemInfo: {} }],
    ['the probe times out too', { ok: false, reason: 'TIMEOUT' }],
    ['the gateway errors', { ok: false, reason: 'DEVICE_GATEWAY_ERROR' }],
  ])('keeps the timeout when %s', async (_case, probe) => {
    mocks.readDeviceSystemInfo.mockResolvedValueOnce(probe);
    const raw = timeout();

    expect(await resolveDispatchTimeout(raw, target)).toBe(raw);
  });

  it('probes a bare transport timeout code as well', async () => {
    mocks.readDeviceSystemInfo.mockResolvedValueOnce({ ok: false, reason: 'DEVICE_OFFLINE' });

    expect(await resolveDispatchTimeout('DEVICE_RESPONSE_TIMEOUT (HTTP 504)', target)).toBe(
      'DEVICE_OFFLINE',
    );
  });
});
