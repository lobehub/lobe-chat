import type { DeviceListItem } from '@lobechat/types';

import { isDevicePresenceUnknown } from '@/store/device';

/**
 * What the remote agent card says about its bound device.
 *
 * Returns:
 * - `none` when nothing is bound
 * - `checking` while the device list is still the stored copy and either
 *   lacks the device (it may be newer than the copy, or past its row cap) or
 *   holds it with unknown presence
 * - `missing` once the server confirmed the list without the device
 * - `online` / `offline` from a confirmed row
 */
export const getBoundDevicePresence = (
  boundDeviceId: string | undefined,
  boundDevice: Pick<DeviceListItem, 'online' | 'onlineUnknown'> | undefined,
  isConfirmed: boolean,
): 'checking' | 'missing' | 'none' | 'offline' | 'online' => {
  if (!boundDeviceId) return 'none';
  if (!boundDevice) return isConfirmed ? 'missing' : 'checking';
  if (isDevicePresenceUnknown(boundDevice)) return 'checking';
  return boundDevice.online ? 'online' : 'offline';
};
