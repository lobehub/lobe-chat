import debug from 'debug';

import { deviceGateway } from '@/server/services/deviceGateway';

import { toDispatchErrorCode } from '../../helpers/heteroErrors';

const log = debug('lobe-server:ai-agent-service');

/**
 * Clients heartbeat every 30s. A socket whose last heartbeat is older than one
 * and a half intervals has most likely died without the gateway noticing yet
 * (it only drops silent sockets on a 90s alarm), so a run sent into it never
 * arrived.
 */
const STALE_HEARTBEAT_MS = 45_000;

/** Gateway answers that mean no connection of this device is left to run anything. */
const DEFINITE_OFFLINE_REASONS = new Set(['DEVICE_NOT_FOUND', 'DEVICE_OFFLINE']);

const readHeartbeatAge = (raw: string): number | undefined => {
  try {
    const body: unknown = JSON.parse(raw);
    if (!body || typeof body !== 'object' || !('timeSinceHeartbeatMs' in body)) return;
    const age = body.timeSinceHeartbeatMs;
    return typeof age === 'number' && Number.isFinite(age) ? age : undefined;
  } catch {
    return;
  }
};

/**
 * A run dispatch that timed out leaves two very different situations behind:
 * the device was already gone and nothing ran (the common case), or it is alive
 * and slow, so the run may have started. Telling them apart decides whether the
 * user should simply reconnect and retry, or first check for a run in progress.
 *
 * Returns the code to describe the failure with: `DEVICE_OFFLINE` when the
 * gateway's heartbeat age or a fresh probe says the device is gone, otherwise
 * the raw error unchanged. Only a definite gateway answer counts as offline —
 * a probe that itself times out or hits a gateway error proves nothing.
 */
export const resolveDispatchTimeout = async (
  raw: string | undefined,
  target: { deviceId: string; userId: string; workspaceId?: string },
): Promise<string | undefined> => {
  if (!raw || toDispatchErrorCode(raw) !== 'DEVICE_RESPONSE_TIMEOUT') return raw;

  const heartbeatAge = readHeartbeatAge(raw);
  if (heartbeatAge !== undefined && heartbeatAge > STALE_HEARTBEAT_MS) {
    log('dispatch timeout on a stale socket (heartbeat %dms ago): offline', heartbeatAge);
    return 'DEVICE_OFFLINE';
  }

  const probe = await deviceGateway.readDeviceSystemInfo(
    target.userId,
    target.deviceId,
    target.workspaceId,
  );
  if (!probe.ok && DEFINITE_OFFLINE_REASONS.has(probe.reason)) {
    log('dispatch timeout, device probe answered %s: offline', probe.reason);
    return 'DEVICE_OFFLINE';
  }

  return raw;
};
