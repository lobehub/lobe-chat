import type { DeviceListItem } from '@lobechat/types';

import type { DeviceListResult } from '@/store/device';

type BoundaryInput = Pick<
  DeviceListResult,
  'data' | 'error' | 'isConfirmed' | 'isLoading' | 'isValidating'
>;

/**
 * `AsyncBoundary`'s `data` / `isLoading` for a device page that shows part of
 * the list (one pool, one device).
 *
 * A reload restores the list from storage before the server answers, and that
 * copy may be stale or miss rows — so `isEmpty` (no device in this pool, the
 * opened device missing) only counts once the server confirmed the list.
 * Before that the surface stays loading, and a failed refresh reaches the
 * error state instead of settling on onboarding or "not found".
 */
export const getDeviceListBoundary = (
  list: BoundaryInput,
  isEmpty: boolean,
): { data: DeviceListItem[] | undefined; isLoading: boolean } => {
  const isPending = !list.isConfirmed && isEmpty;

  return {
    data: isPending ? undefined : list.data,
    isLoading: list.isLoading || (isPending && (!list.error || list.isValidating)),
  };
};
