import { useEffect, useMemo } from 'react';

export const FILES_LOCATION_STORAGE_KEY = 'LOBE_WORKING_SIDEBAR_FILES_LOCATION';
const MAX_REMEMBERED_LOCATIONS = 100;

export interface FilesLocation {
  /** Remote device the tree is read from; undefined is this machine. */
  deviceId?: string;
  directory: string;
}

type RememberedLocations = Record<string, FilesLocation>;

const readLocations = (): RememberedLocations => {
  try {
    const raw = window.localStorage.getItem(FILES_LOCATION_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : undefined;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeLocation = (contextKey: string, location: FilesLocation) => {
  try {
    const { [contextKey]: previous, ...rest } = readLocations();
    if (previous?.directory === location.directory && previous?.deviceId === location.deviceId)
      return;
    // Re-inserted last so the oldest contexts are the ones that fall off.
    const entries = Object.entries({ ...rest, [contextKey]: location });
    window.localStorage.setItem(
      FILES_LOCATION_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(entries.slice(-MAX_REMEMBERED_LOCATIONS))),
    );
  } catch {
    // Best-effort: without it the tree simply waits for the device list.
  }
};

/**
 * The Files tree's directory, stable across a cold start.
 *
 * Until the device list arrives the working directory cannot be resolved for
 * real: a device default is unknown, so it reads as the home fallback (desktop)
 * or nothing (web) and then jumps. The tree is keyed by that directory, so the
 * jump meant reading the wrong tree first — or hiding the tab — and the cached
 * tree for the right one never got a chance to paint. Until `settled`, the
 * directory this conversation resolved to last time stands in; once settled,
 * the live resolution wins and is remembered for next time.
 */
export const useRememberedFilesLocation = (
  contextKey: string | undefined,
  resolved: FilesLocation | undefined,
  settled: boolean,
): FilesLocation | undefined => {
  const remembered = useMemo(
    () => (contextKey && !settled ? readLocations()[contextKey] : undefined),
    [contextKey, settled],
  );

  const resolvedDirectory = resolved?.directory;
  const resolvedDeviceId = resolved?.deviceId;
  useEffect(() => {
    if (!contextKey || !settled || resolvedDirectory === undefined) return;
    writeLocation(contextKey, { deviceId: resolvedDeviceId, directory: resolvedDirectory });
  }, [contextKey, resolvedDeviceId, resolvedDirectory, settled]);

  if (settled) return resolved;
  return remembered ?? resolved;
};
