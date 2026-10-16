import type { DeviceListItem } from '@lobechat/types';

import { useDeviceList } from '@/features/DeviceManager/useDeviceList';

/** Re-reads presence so a device that drops or reconnects shows it without a refocus. */
export const PRESENCE_REFRESH_INTERVAL_MS = 30_000;

/**
 * The device a topic is bound to, kept live while the Overview is on screen.
 * The device list does not poll on its own, so without this a device that
 * disconnects keeps its old presence until the window is refocused.
 */
export const useBoundDevice = (deviceId: string, active: boolean): DeviceListItem | undefined => {
  const { data: devices } = useDeviceList({
    refreshInterval: active ? PRESENCE_REFRESH_INTERVAL_MS : 0,
  });

  return devices?.find((item) => item.deviceId === deviceId);
};
