import type { DeviceListItem, DeviceScope } from '@lobechat/types';

/**
 * Counts live connections within one principal scope.
 *
 * Use when:
 * - A scope-level control summarizes all authorized device presence
 * - A personal control needs the count for one logical device
 *
 * Expects:
 * - Device channels were already filtered by the server for the active principal
 *
 * Returns:
 * - The number of live connections in the requested scope and optional device
 */
export const getScopedConnectionCount = (
  devices: DeviceListItem[] | undefined,
  scope: DeviceScope,
  deviceId?: string,
): number | undefined => {
  if (!devices) return undefined;

  return devices
    .filter((device) => device.scope === scope && (!deviceId || device.deviceId === deviceId))
    .reduce((count, device) => count + device.channels.length, 0);
};
