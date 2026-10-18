import type { DeviceListItem, WorkingDirEntry, WorkingDirRepoType } from '@lobechat/types';

import { refreshDeviceList } from '@/features/DeviceManager/const';
import { createReplicaSlice, recordLens, type ReplicaSyncResult } from '@/libs/replica';
import { deviceService } from '@/services/device';
import { type StoreSetter } from '@/store/types';
import { isTrpcErrorCode } from '@/utils/trpcError';

import {
  nextWorkingDirs,
  removeWorkingDir,
  setWorkingDirRepoType,
  WORKING_DIRS_MAX,
} from './deviceCwd';
import { DEVICE_LIST_KEY, type DeviceListParams, deviceListResource } from './projection';
import { deviceSelectors } from './selectors';
import { type DeviceStore } from './store';

type Setter = StoreSetter<DeviceStore>;

const LIST_PARAMS = {} as DeviceListParams;

/** How long a repo-type correction that failed transiently waits before it may be re-sent. */
const REPO_TYPE_SYNC_RETRY_MS = 60 * 1000;

type UpdateDeviceInput = Parameters<typeof deviceService.updateDevice>[0];

/**
 * Persist user-editable fields, routed by the device's own scope. Workspace
 * devices live under `workspace_id`, so the userId-scoped personal mutation
 * would match no row and the write would be silently dropped.
 */
const persistDevice = (device: DeviceListItem | undefined, input: UpdateDeviceInput) =>
  device?.scope === 'workspace'
    ? deviceService.updateWorkspaceDevice(input)
    : deviceService.updateDevice(input);

export const deviceSlice = (set: Setter, get: () => DeviceStore, _api?: unknown) =>
  new DeviceActionImpl(set, get, _api);

export class DeviceActionImpl {
  readonly #get: () => DeviceStore;
  readonly #list;
  /** `syncWorkingDirRepoType` targets that may not be sent again before the given time. */
  readonly #repoTypeSyncBlockedUntil = new Map<string, number>();

  constructor(set: Setter, get: () => DeviceStore, _api?: unknown) {
    void _api;
    this.#get = get;
    this.#list = createReplicaSlice(deviceListResource, {
      actionPrefix: 'device/list',
      fetcher: () => deviceService.listDevices(),
      get,
      set,
      stateKey: 'deviceListReplica',
      view: recordLens<DeviceStore, DeviceListItem[]>('deviceListMap'),
    });
  }

  #devices = (): DeviceListItem[] => deviceSelectors.deviceList(this.#get());

  /** Patch one device row optimistically; rolls back if `serverCall` rejects. */
  #patchDevice = <T>(
    deviceId: string,
    patch: (device: DeviceListItem) => DeviceListItem,
    serverCall: () => Promise<T>,
  ): Promise<T> =>
    this.#list.optimistic(
      DEVICE_LIST_KEY,
      (devices) => devices.map((d) => (d.deviceId === deviceId ? patch(d) : d)),
      serverCall,
    );

  /**
   * Revalidate both device lists: this store's replica and the canonical
   * workspace-scoped `useDeviceList` entry, which task controls read.
   */
  #revalidateDeviceLists = () =>
    Promise.all([this.#list.revalidate(DEVICE_LIST_KEY), refreshDeviceList()]);

  /**
   * Seed the persisted device list before the route commits, so the bound
   * device's name and cwd paint on the first frame instead of after the
   * mount-time hydrate. Call from a route loader, bounded by a timeout.
   */
  preHydrateDeviceList = async (): Promise<boolean> => {
    const scope = deviceListResource.scope.get();
    // The slot may still hold the previous identity's rows; drop them first.
    this.#list.ensureScope(scope);
    return this.#list.hydrate(LIST_PARAMS, scope);
  };

  /**
   * Persist a working-directory choice to a device (`defaultCwd` + `workingDirs`)
   * with an optimistic store update, then revalidate from the server. Pass
   * `setDefault: false` to record the dir in the recent list without repointing
   * the device's default cwd.
   */
  updateDeviceCwd = async (
    deviceId: string,
    entry: WorkingDirEntry,
    options: { setDefault?: boolean } = {},
  ): Promise<void> => {
    const trimmed = entry.path.trim();
    if (!trimmed) return;
    const setDefault = options.setDefault ?? true;

    const device = this.#devices().find((d) => d.deviceId === deviceId);
    const updatedDirs = nextWorkingDirs(entry, device?.workingDirs ?? []);

    try {
      // Spreading widens the item out of the listDevices union, so re-assert it.
      await this.#patchDevice(
        deviceId,
        (d) =>
          ({
            ...d,
            ...(setDefault ? { defaultCwd: trimmed } : {}),
            workingDirs: updatedDirs,
          }) as DeviceListItem,
        async () => {
          if (device?.scope === 'workspace') {
            // Members share this list: add the one entry server-side instead of
            // replacing the list with this client's possibly stale snapshot.
            await deviceService.addWorkspaceDeviceWorkingDir({
              deviceId,
              entry: { ...entry, path: trimmed },
            });
            if (setDefault)
              await deviceService.updateWorkspaceDevice({ defaultCwd: trimmed, deviceId });
          } else {
            await deviceService.updateDevice({
              deviceId,
              ...(setDefault ? { defaultCwd: trimmed } : {}),
              workingDirs: updatedDirs,
            });
          }
        },
      );
    } finally {
      // Re-fetch the truth (server-normalized fields, other tabs' writes).
      await this.#revalidateDeviceLists();
    }
  };

  /** Clear a device's default cwd without removing it from the recent directory list. */
  clearDeviceDefaultCwd = async (deviceId: string): Promise<void> => {
    const device = this.#devices().find((d) => d.deviceId === deviceId);
    if (!device?.defaultCwd) return;

    try {
      // A failed write rolls back to the prior default.
      await this.#patchDevice(
        deviceId,
        (d) => ({ ...d, defaultCwd: null }) as DeviceListItem,
        () => persistDevice(device, { defaultCwd: null, deviceId }),
      );
    } finally {
      await this.#revalidateDeviceLists();
    }
  };

  /**
   * Merge legacy recent dirs (read from localStorage by the caller — the store
   * stays out of feature-layer storage) into a device's `device.workingDirs`.
   * Existing device entries win on conflict. Rejects if the persist fails so the
   * caller can keep localStorage for a retry; resolves once safely merged.
   */
  migrateLocalRecentsToDevice = async (
    deviceId: string,
    legacyEntries: WorkingDirEntry[],
  ): Promise<void> => {
    if (legacyEntries.length === 0) return;

    const device = this.#devices().find((d) => d.deviceId === deviceId);
    const existing = device?.workingDirs ?? [];
    const existingPaths = new Set(existing.map((d) => d.path));
    const merged = [...existing, ...legacyEntries.filter((d) => !existingPaths.has(d.path))].slice(
      0,
      WORKING_DIRS_MAX,
    );

    try {
      await this.#patchDevice(
        deviceId,
        (d) => ({ ...d, workingDirs: merged }) as DeviceListItem,
        () => persistDevice(device, { deviceId, workingDirs: merged }),
      );
    } finally {
      await this.#revalidateDeviceLists();
    }
  };

  /** Remove a path from a device's `workingDirs` recent list (optimistic). */
  removeDeviceWorkingDir = async (deviceId: string, path: string): Promise<void> => {
    const device = this.#devices().find((d) => d.deviceId === deviceId);
    if (!device) return;
    const updated = removeWorkingDir(path, device.workingDirs ?? []);

    try {
      await this.#patchDevice(
        deviceId,
        (d) => ({ ...d, workingDirs: updated }) as DeviceListItem,
        () =>
          device.scope === 'workspace'
            ? deviceService.removeWorkspaceDeviceWorkingDir({ deviceId, path })
            : deviceService.updateDevice({ deviceId, workingDirs: updated }),
      );
    } finally {
      await this.#revalidateDeviceLists();
    }
  };

  /**
   * Correct a device working dir's cached `repoType` in place after a live probe
   * disagreed with it — e.g. a folder registered while still empty and cloned
   * into afterwards. Neither reorders nor adds entries; a no-op when nothing
   * changes, and until the server has confirmed the list (a persisted copy holds
   * stale `workingDirs`, and a personal write sends the whole list). A failed
   * write must not loop with the revalidation that restores the stale value, so
   * its target is held back: for the rest of the session when the server refused
   * it (a viewer cannot edit a shared device), for `REPO_TYPE_SYNC_RETRY_MS`
   * after a transient failure. A write that succeeds holds nothing back, so a
   * later legitimate change to the same value is sent.
   *
   * Resolves, when the correction was held back, the time it may be sent again
   * (`Infinity` for never) so a caller can schedule the retry; otherwise
   * `undefined`.
   */
  syncWorkingDirRepoType = async (
    deviceId: string,
    path: string,
    repoType: WorkingDirRepoType | undefined,
  ): Promise<number | undefined> => {
    if (!deviceSelectors.isDeviceListConfirmed(this.#get())) return;
    const device = this.#devices().find((d) => d.deviceId === deviceId);
    if (!device) return;
    const updated = setWorkingDirRepoType(device.workingDirs ?? [], path, repoType);
    if (!updated) return;

    const syncKey = JSON.stringify([deviceId, path, repoType ?? null]);
    const blockedUntil = this.#repoTypeSyncBlockedUntil.get(syncKey) ?? 0;
    if (blockedUntil > Date.now()) return blockedUntil;
    // Held back while in flight too, so a re-render cannot send it twice.
    this.#repoTypeSyncBlockedUntil.set(syncKey, Number.POSITIVE_INFINITY);

    try {
      await this.#patchDevice(
        deviceId,
        (d) => ({ ...d, workingDirs: updated }) as DeviceListItem,
        async () => {
          try {
            await (device.scope === 'workspace'
              ? deviceService.setWorkspaceDeviceWorkingDirRepoType({ deviceId, path, repoType })
              : deviceService.updateDevice({ deviceId, workingDirs: updated }));
            this.#repoTypeSyncBlockedUntil.delete(syncKey);
          } catch (error) {
            // Recorded before the rollback re-renders the stale entry, so a
            // caller that re-runs on that render already learns when to retry.
            const refused =
              isTrpcErrorCode(error, 'FORBIDDEN') || isTrpcErrorCode(error, 'UNAUTHORIZED');
            this.#repoTypeSyncBlockedUntil.set(
              syncKey,
              refused ? Number.POSITIVE_INFINITY : Date.now() + REPO_TYPE_SYNC_RETRY_MS,
            );
            throw error;
          }
        },
      );
    } finally {
      await this.#revalidateDeviceLists();
    }
  };

  /**
   * Fetch orchestration only; read the rows with `deviceSelectors.deviceList`.
   * The persisted copy paints first (presence unknown), then the server
   * confirms it in the background.
   */
  useFetchDevices = (enabled = false): ReplicaSyncResult =>
    this.#list.useSync(LIST_PARAMS, { enabled });
}

export type DeviceAction = Pick<DeviceActionImpl, keyof DeviceActionImpl>;
