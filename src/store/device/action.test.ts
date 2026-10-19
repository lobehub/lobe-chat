import type { DeviceListItem, WorkingDirEntry } from '@lobechat/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEVICE_LIST_SWR_KEY } from '@/features/DeviceManager/const';
import { cacheScope } from '@/libs/replica';
import { mutate } from '@/libs/swr';
import { deviceService } from '@/services/device';

import { initialState } from './initialState';
import { DEVICE_LIST_KEY } from './projection';
import { deviceSelectors } from './selectors';
import { useDeviceStore } from './store';

vi.mock('@/libs/swr', () => ({
  mutate: vi.fn(),
  useClientDataSWR: vi.fn(),
}));

const seedDevices = (devices: DeviceListItem[]) =>
  useDeviceStore.setState({ deviceListMap: { [DEVICE_LIST_KEY]: devices } });

/** Seed a list the server has confirmed this session (not just the persisted copy). */
const seedConfirmedDevices = (devices: DeviceListItem[]) =>
  useDeviceStore.setState((state) => ({
    deviceListMap: { [DEVICE_LIST_KEY]: devices },
    deviceListReplica: {
      ...state.deviceListReplica,
      entries: {
        ...state.deviceListReplica.entries,
        [DEVICE_LIST_KEY]: { pending: [], source: 'server', updatedAt: Date.now() },
      },
    },
  }));

const workingDirsOf = (deviceId: string) =>
  deviceSelectors.getDeviceWorkingDirs(deviceId)(useDeviceStore.getState());

/** The SWR matchers the action revalidated with. */
const revalidatedMatchers = () =>
  vi
    .mocked(mutate)
    .mock.calls.map(([key]) => key)
    .filter((key): key is (key: unknown) => boolean => typeof key === 'function');

const revalidatedDeviceListReplica = () =>
  revalidatedMatchers().some((matcher) =>
    matcher(['replica:sync', 'deviceList', 1, cacheScope.get(), DEVICE_LIST_KEY, {}]),
  );

const buildDevice = (overrides: Partial<DeviceListItem> = {}): DeviceListItem => ({
  channels: [],
  defaultCwd: '/repo',
  deviceId: 'dev-1',
  enroller: null,
  friendlyName: null,
  hostname: null,
  identitySource: 'machine-id',
  lastSeen: new Date(0).toISOString(),
  online: false,
  platform: null,
  registered: true,
  scope: 'personal',
  visibility: null,
  workingDirs: [],
  ...overrides,
});

describe('DeviceAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mutate).mockResolvedValue(undefined);
    vi.spyOn(deviceService, 'updateDevice').mockResolvedValue({ success: true });
    vi.spyOn(deviceService, 'updateWorkspaceDevice').mockResolvedValue({ success: true });
    vi.spyOn(deviceService, 'addWorkspaceDeviceWorkingDir').mockResolvedValue({ success: true });
    vi.spyOn(deviceService, 'removeWorkspaceDeviceWorkingDir').mockResolvedValue({
      success: true,
    });
    vi.spyOn(deviceService, 'setWorkspaceDeviceWorkingDirRepoType').mockResolvedValue({
      success: true,
    });
    useDeviceStore.setState(initialState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('clearDeviceDefaultCwd', () => {
    it('clears the device default without removing it from recent directories', async () => {
      const workingDirs: WorkingDirEntry[] = [
        { path: '/repo', repoType: 'git' },
        { path: '/other' },
      ];
      const otherDevice = buildDevice({
        defaultCwd: '/other-device',
        deviceId: 'dev-2',
        workingDirs: [{ path: '/other-device' }],
      });
      seedDevices([buildDevice({ workingDirs }), otherDevice]);

      await useDeviceStore.getState().clearDeviceDefaultCwd('dev-1');

      const state = useDeviceStore.getState();
      expect(deviceSelectors.getDeviceDefaultCwd('dev-1')(state)).toBeUndefined();
      expect(deviceSelectors.getDeviceWorkingDirs('dev-1')(state)).toEqual(workingDirs);
      expect(deviceSelectors.getDeviceById('dev-2')(state)).toEqual(otherDevice);
      expect(deviceService.updateDevice).toHaveBeenCalledWith({
        defaultCwd: null,
        deviceId: 'dev-1',
      });
      expect(revalidatedDeviceListReplica()).toBe(true);
    });

    // Task controls read the workspace-scoped `useDeviceList` entry, so a cwd
    // write that only revalidated this store's key left them showing stale recents.
    it('also revalidates the canonical device-list cache', async () => {
      seedDevices([buildDevice()]);

      await useDeviceStore.getState().clearDeviceDefaultCwd('dev-1');

      const matchers = revalidatedMatchers();
      expect(matchers.some((matcher) => matcher([DEVICE_LIST_SWR_KEY, 'ws-1']))).toBe(true);
      expect(revalidatedDeviceListReplica()).toBe(true);
    });

    it('does nothing when the target device does not exist', async () => {
      seedDevices([buildDevice()]);

      await useDeviceStore.getState().clearDeviceDefaultCwd('missing');

      expect(deviceService.updateDevice).not.toHaveBeenCalled();
      expect(mutate).not.toHaveBeenCalled();
    });

    it('restores the previous default and revalidates when persistence fails', async () => {
      const workingDirs: WorkingDirEntry[] = [{ path: '/repo', repoType: 'git' }];
      seedDevices([buildDevice({ workingDirs })]);
      vi.mocked(deviceService.updateDevice).mockRejectedValueOnce(new Error('save failed'));

      await expect(useDeviceStore.getState().clearDeviceDefaultCwd('dev-1')).rejects.toThrow(
        'save failed',
      );

      const state = useDeviceStore.getState();
      expect(deviceSelectors.getDeviceDefaultCwd('dev-1')(state)).toBe('/repo');
      expect(deviceSelectors.getDeviceWorkingDirs('dev-1')(state)).toEqual(workingDirs);
      expect(revalidatedDeviceListReplica()).toBe(true);
    });
  });

  // Workspace devices are stored under `workspace_id`; the personal mutation is
  // userId-scoped and would silently drop the write, so removed dirs came back.
  describe('workspace devices', () => {
    const workspaceDevice = () =>
      buildDevice({
        deviceId: 'ws-dev',
        scope: 'workspace',
        workingDirs: [{ path: '/a' }, { path: '/b' }],
      });

    // Members share the list, so only the touched entry is sent — never this
    // client's whole (possibly stale) snapshot.
    it('removes one recent dir through the workspace entry mutation', async () => {
      seedDevices([workspaceDevice()]);

      await useDeviceStore.getState().removeDeviceWorkingDir('ws-dev', '/a');

      expect(deviceService.removeWorkspaceDeviceWorkingDir).toHaveBeenCalledWith({
        deviceId: 'ws-dev',
        path: '/a',
      });
      expect(deviceService.updateWorkspaceDevice).not.toHaveBeenCalled();
      expect(deviceService.updateDevice).not.toHaveBeenCalled();
      expect(deviceSelectors.getDeviceWorkingDirs('ws-dev')(useDeviceStore.getState())).toEqual([
        { path: '/b' },
      ]);
    });

    it('adds one picked dir through the workspace entry mutation', async () => {
      seedDevices([workspaceDevice()]);

      await useDeviceStore
        .getState()
        .updateDeviceCwd('ws-dev', { path: ' /c ' }, { setDefault: false });

      expect(deviceService.addWorkspaceDeviceWorkingDir).toHaveBeenCalledWith({
        deviceId: 'ws-dev',
        entry: { path: '/c' },
      });
      expect(deviceService.updateWorkspaceDevice).not.toHaveBeenCalled();
      expect(deviceService.updateDevice).not.toHaveBeenCalled();
    });

    it('sets the device default separately from the entry add', async () => {
      seedDevices([workspaceDevice()]);

      await useDeviceStore.getState().updateDeviceCwd('ws-dev', { path: '/c' });

      expect(deviceService.addWorkspaceDeviceWorkingDir).toHaveBeenCalledWith({
        deviceId: 'ws-dev',
        entry: { path: '/c' },
      });
      expect(deviceService.updateWorkspaceDevice).toHaveBeenCalledWith({
        defaultCwd: '/c',
        deviceId: 'ws-dev',
      });
    });

    it('keeps personal devices on the personal mutation', async () => {
      seedDevices([buildDevice({ workingDirs: [{ path: '/a' }] })]);

      await useDeviceStore.getState().removeDeviceWorkingDir('dev-1', '/a');

      expect(deviceService.updateDevice).toHaveBeenCalledWith({
        deviceId: 'dev-1',
        workingDirs: [],
      });
      expect(deviceService.updateWorkspaceDevice).not.toHaveBeenCalled();
    });
  });

  // The device store is a singleton and remembers which corrections it held
  // back, so each case below uses its own path.
  describe('syncWorkingDirRepoType', () => {
    it('corrects a workspace device entry in place through the entry mutation', async () => {
      seedConfirmedDevices([
        buildDevice({
          deviceId: 'ws-dev',
          scope: 'workspace',
          workingDirs: [{ path: '/other' }, { path: '/cloned-later' }],
        }),
      ]);

      await useDeviceStore.getState().syncWorkingDirRepoType('ws-dev', '/cloned-later', 'github');

      expect(deviceService.setWorkspaceDeviceWorkingDirRepoType).toHaveBeenCalledWith({
        deviceId: 'ws-dev',
        path: '/cloned-later',
        repoType: 'github',
      });
      expect(deviceService.updateDevice).not.toHaveBeenCalled();
      expect(workingDirsOf('ws-dev')).toEqual([
        { path: '/other' },
        { path: '/cloned-later', repoType: 'github' },
      ]);
      expect(revalidatedDeviceListReplica()).toBe(true);
    });

    it('writes the patched list for a personal device', async () => {
      seedConfirmedDevices([buildDevice({ workingDirs: [{ path: '/personal' }, { path: '/b' }] })]);

      await useDeviceStore.getState().syncWorkingDirRepoType('dev-1', '/personal', 'git');

      expect(deviceService.updateDevice).toHaveBeenCalledWith({
        deviceId: 'dev-1',
        workingDirs: [{ path: '/personal', repoType: 'git' }, { path: '/b' }],
      });
    });

    it('does nothing when the entry already matches or is not in the list', async () => {
      seedConfirmedDevices([buildDevice({ workingDirs: [{ path: '/same', repoType: 'git' }] })]);

      await useDeviceStore.getState().syncWorkingDirRepoType('dev-1', '/same', 'git');
      await useDeviceStore.getState().syncWorkingDirRepoType('dev-1', '/not-listed', 'git');

      expect(deviceService.updateDevice).not.toHaveBeenCalled();
      expect(mutate).not.toHaveBeenCalled();
    });

    // A persisted copy holds stale `workingDirs`; a personal write sends the
    // whole list and would overwrite newer entries with it.
    it('waits for the server-confirmed list before writing', async () => {
      seedDevices([buildDevice({ workingDirs: [{ path: '/persisted-copy' }] })]);

      await useDeviceStore.getState().syncWorkingDirRepoType('dev-1', '/persisted-copy', 'git');

      expect(deviceService.updateDevice).not.toHaveBeenCalled();
      expect(workingDirsOf('dev-1')).toEqual([{ path: '/persisted-copy' }]);
    });

    // A viewer cannot edit a shared device: the rollback restores the stale
    // value, which must not trigger the same refused write again.
    it('never re-sends a correction the server refused', async () => {
      seedConfirmedDevices([
        buildDevice({
          deviceId: 'ws-dev',
          scope: 'workspace',
          workingDirs: [{ path: '/forbidden' }],
        }),
      ]);
      vi.mocked(deviceService.setWorkspaceDeviceWorkingDirRepoType).mockRejectedValueOnce(
        Object.assign(new Error('forbidden'), { data: { code: 'FORBIDDEN' } }),
      );
      const now = vi.spyOn(Date, 'now').mockReturnValue(1_000_000);

      await expect(
        useDeviceStore.getState().syncWorkingDirRepoType('ws-dev', '/forbidden', 'github'),
      ).rejects.toThrow('forbidden');
      expect(workingDirsOf('ws-dev')).toEqual([{ path: '/forbidden' }]);
      now.mockReturnValue(1_000_000 + 24 * 60 * 60 * 1000);
      await expect(
        useDeviceStore.getState().syncWorkingDirRepoType('ws-dev', '/forbidden', 'github'),
      ).resolves.toBe(Number.POSITIVE_INFINITY);

      expect(deviceService.setWorkspaceDeviceWorkingDirRepoType).toHaveBeenCalledTimes(1);
    });

    // A network blip must not block the correction for the rest of the session.
    it('re-sends a correction after a transient failure once the retry delay passes', async () => {
      seedConfirmedDevices([
        buildDevice({
          deviceId: 'ws-dev',
          scope: 'workspace',
          workingDirs: [{ path: '/transient' }],
        }),
      ]);
      vi.mocked(deviceService.setWorkspaceDeviceWorkingDirRepoType).mockRejectedValueOnce(
        new Error('fetch failed'),
      );
      const now = vi.spyOn(Date, 'now').mockReturnValue(2_000_000);

      await expect(
        useDeviceStore.getState().syncWorkingDirRepoType('ws-dev', '/transient', 'github'),
      ).rejects.toThrow('fetch failed');
      // Rolled back to the stale entry, and held back until the retry time.
      expect(workingDirsOf('ws-dev')).toEqual([{ path: '/transient' }]);
      await expect(
        useDeviceStore.getState().syncWorkingDirRepoType('ws-dev', '/transient', 'github'),
      ).resolves.toBe(2_000_000 + 60 * 1000);
      expect(deviceService.setWorkspaceDeviceWorkingDirRepoType).toHaveBeenCalledTimes(1);

      now.mockReturnValue(2_000_000 + 61 * 1000);
      await useDeviceStore.getState().syncWorkingDirRepoType('ws-dev', '/transient', 'github');
      expect(deviceService.setWorkspaceDeviceWorkingDirRepoType).toHaveBeenCalledTimes(2);
    });

    // The dir lost its repo and was cloned into again: the second `git` is a
    // new change, not a repeat of the first.
    it('re-sends a value it already wrote once the entry changed back', async () => {
      seedConfirmedDevices([buildDevice({ workingDirs: [{ path: '/recloned' }] })]);

      await useDeviceStore.getState().syncWorkingDirRepoType('dev-1', '/recloned', 'git');
      await useDeviceStore.getState().syncWorkingDirRepoType('dev-1', '/recloned', undefined);
      await useDeviceStore.getState().syncWorkingDirRepoType('dev-1', '/recloned', 'git');

      expect(deviceService.updateDevice).toHaveBeenCalledTimes(3);
      expect(deviceService.updateDevice).toHaveBeenLastCalledWith({
        deviceId: 'dev-1',
        workingDirs: [{ path: '/recloned', repoType: 'git' }],
      });
    });
  });
});
