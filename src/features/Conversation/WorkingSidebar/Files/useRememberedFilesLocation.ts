import { useEffect, useMemo } from 'react';

import { cacheScope } from '@/libs/replica';
import {
  type FilesLocation,
  peekFilesLocation,
  projectFileActions,
  useProjectFileStore,
} from '@/store/projectFile';

export type { FilesLocation } from '@/store/projectFile';

/**
 * The Files tree's directory, stable across a cold start.
 *
 * Until the device list arrives the working directory cannot be resolved for
 * real: a device default is unknown, so it reads as the home fallback (desktop)
 * or nothing (web) and then jumps. The tree is keyed by that directory, so the
 * jump meant reading the wrong tree first — or hiding the tab — and the saved
 * tree for the right one never got a chance to paint. Until `settled`, the
 * directory this conversation resolved to last time (the `filesLocation`
 * replica) stands in; once settled, the live resolution wins and is remembered
 * for next time.
 */
export const useRememberedFilesLocation = (
  contextKey: string | undefined,
  resolved: FilesLocation | undefined,
  settled: boolean,
): FilesLocation | undefined => {
  const scope = cacheScope.use();
  const params = useMemo(() => (contextKey ? { contextKey } : null), [contextKey]);
  const stored = useProjectFileStore((s) => (contextKey ? s.filesLocation[contextKey] : undefined));
  projectFileActions.useFetchFilesLocation(params);
  // Until the replica has hydrated the entry, its row is read here so the
  // first frame already opens the saved tree.
  const peeked = useMemo(
    () => (contextKey && !stored ? peekFilesLocation(contextKey, scope) : undefined),
    [contextKey, scope, stored],
  );
  const remembered = stored ?? peeked;

  const resolvedDirectory = resolved?.directory;
  const resolvedDeviceId = resolved?.deviceId;
  useEffect(() => {
    if (!contextKey || !settled || resolvedDirectory === undefined) return;
    if (remembered?.directory === resolvedDirectory && remembered?.deviceId === resolvedDeviceId)
      return;
    projectFileActions.rememberFilesLocation(contextKey, {
      deviceId: resolvedDeviceId,
      directory: resolvedDirectory,
    });
  }, [contextKey, remembered, resolvedDeviceId, resolvedDirectory, settled]);

  if (settled) return resolved;
  return remembered ?? resolved;
};
