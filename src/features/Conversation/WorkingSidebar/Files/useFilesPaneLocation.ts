import { useDeviceStore } from '@/store/device';

import { filesLocationContextKey, useRememberedFilesLocation } from './useRememberedFilesLocation';

interface FilesPaneLocationParams {
  activeAgentId?: string;
  /** This machine or a bound device can read a filesystem tree. */
  filesystemEnvironmentAvailable: boolean;
  isSandboxExecution: boolean;
  remoteDeviceId?: string;
  /** The instance's directory; the empty string IS the workspace root. */
  sandboxDirectory: string;
  sandboxDirectoryKnown: boolean;
  sandboxInstanceId?: string;
  sandboxTopicId?: string;
  topicId?: string;
  workingDirectory?: string;
}

export interface FilesPaneLocation {
  deviceId?: string;
  directory?: string;
  /** A sandbox tree is read through its own instance, not a device. */
  isSandbox: boolean;
}

/**
 * Which tree the Files tab shows: host + directory.
 *
 * A sandbox resolves from its instance (or, with none picked, from the topic
 * that names the warm session), and is final as soon as the instance directory
 * is known. A device-backed directory is only final once the device list has
 * loaded; until then the tree opens where this conversation last was, so its
 * cached index can paint instead of a home-directory read or a missing tab.
 */
export const useFilesPaneLocation = ({
  activeAgentId,
  filesystemEnvironmentAvailable,
  isSandboxExecution,
  remoteDeviceId,
  sandboxDirectory,
  sandboxDirectoryKnown,
  sandboxInstanceId,
  sandboxTopicId,
  topicId,
  workingDirectory,
}: FilesPaneLocationParams): FilesPaneLocation => {
  const isSandbox = isSandboxExecution && !!(sandboxInstanceId || sandboxTopicId);
  const liveDirectory = isSandbox
    ? sandboxDirectoryKnown
      ? sandboxDirectory
      : undefined
    : filesystemEnvironmentAvailable
      ? workingDirectory
      : undefined;

  const devicesSettled = useDeviceStore((s) => s.isDevicesInit);
  const filesLocation = useRememberedFilesLocation(
    isSandbox ? undefined : filesLocationContextKey(topicId, activeAgentId),
    liveDirectory === undefined
      ? undefined
      : { deviceId: remoteDeviceId, directory: liveDirectory },
    devicesSettled,
  );

  return {
    deviceId: filesLocation?.deviceId,
    directory: filesLocation?.directory,
    isSandbox,
  };
};
