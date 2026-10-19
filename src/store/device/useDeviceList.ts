import { isDesktop } from '@lobechat/const';
import type { DeviceListItem } from '@lobechat/types';
import { useCallback } from 'react';

import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

import { deviceSelectors } from './selectors';
import { useDeviceStore } from './store';

export interface DeviceListResult {
  /** Every device of the active scope, or `undefined` until storage or the server answers. */
  data: DeviceListItem[] | undefined;
  error: unknown;
  /** Nothing to show yet: no persisted copy and the first request is in flight. */
  isLoading: boolean;
  /** A request is in flight. Never a reason to hide `data`. */
  isValidating: boolean;
  /** Re-fetch, then resolve with the rows now in the store. */
  mutate: () => Promise<DeviceListItem[] | undefined>;
}

/**
 * The device list, read from the device store's replica. ALWAYS use this (or
 * `useFetchDevices` + `deviceSelectors`) for any surface that lists or
 * resolves devices — never `lambdaQuery.device.listDevices` or a second fetch.
 * One request per scope feeds every reader, and the replica is partitioned by
 * user + workspace, so switching workspaces never serves the previous pool.
 *
 * A reload paints the persisted copy first. Its rows carry `onlineUnknown`
 * (stored as offline, no channels) until the server confirms them, so a
 * surface that shows or acts on presence must treat those rows as unknown
 * rather than offline (`isDevicePresenceUnknown`).
 *
 * Devices come from an authed lambda procedure, so only query once signed in
 * (desktop always queries — it lists the local device's registered cwd).
 * A live surface that must track presence passes its own `refreshInterval`.
 */
export const useDeviceList = (config?: { refreshInterval?: number }): DeviceListResult => {
  const isLogin = useUserStore(authSelectors.isLogin);
  const enabled = isLogin || isDesktop;
  const { error, isValidating } = useDeviceStore((s) => s.useFetchDevices)(enabled, config);
  const isLoaded = useDeviceStore(deviceSelectors.isDeviceListLoaded);
  const devices = useDeviceStore(deviceSelectors.deviceList);
  const refreshDevices = useDeviceStore((s) => s.refreshDevices);

  const mutate = useCallback(async () => {
    await refreshDevices();
    const state = useDeviceStore.getState();
    return deviceSelectors.isDeviceListLoaded(state)
      ? deviceSelectors.deviceList(state)
      : undefined;
  }, [refreshDevices]);

  return {
    data: isLoaded ? devices : undefined,
    error,
    isLoading: enabled && !isLoaded && !error,
    isValidating,
    mutate,
  };
};

/**
 * The row came from the persisted copy and the server has not confirmed it
 * yet: its `online: false` is a placeholder, not a fact.
 */
export const isDevicePresenceUnknown = (device: Pick<DeviceListItem, 'onlineUnknown'>): boolean =>
  !!device.onlineUnknown;
