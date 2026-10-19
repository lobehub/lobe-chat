export type DeviceListState = 'empty' | 'loading' | 'ready';

interface GetDeviceListStateOptions {
  hasDevices: boolean;
  /**
   * The server answered this session. A stored copy without rows for this
   * pool may be stale or capped, so it is not proof the pool is empty.
   */
  isConfirmed: boolean;
  isFetching: boolean;
}

export const getDeviceListState = ({
  hasDevices,
  isConfirmed,
  isFetching,
}: GetDeviceListStateOptions): DeviceListState => {
  if (hasDevices) return 'ready';
  return isFetching || !isConfirmed ? 'loading' : 'empty';
};
