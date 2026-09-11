import type { ProjectFileIndexEntry } from '@lobechat/electron-client-ipc';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSingleton } from '@/hooks/useSingleton';
import { projectFileService } from '@/services/projectFile';

interface UseCollapsedDirectoryEntriesParams {
  deviceId?: string;
  /** Entries from the project index — the directories flagged `collapsed` live here. */
  entries: ProjectFileIndexEntry[];
  /** Currently expanded node ids; for indexed rows these are relative paths. */
  expandedIds: string[];
  /** Project root the relative paths resolve against. */
  root: string;
}

interface UseCollapsedDirectoryEntriesResult {
  /** Index entries plus every lazily loaded child, deduped by relative path. */
  entries: ProjectFileIndexEntry[];
  /** Forget a subtree so the next expand re-reads it from disk. */
  invalidate: (relativePath: string) => void;
  /** Relative paths whose listing hit the size cap. */
  truncatedPaths: string[];
}

const mergeEntries = (
  base: ProjectFileIndexEntry[],
  loaded: Record<string, ProjectFileIndexEntry[]>,
): ProjectFileIndexEntry[] => {
  const loadedGroups = Object.values(loaded);
  if (loadedGroups.length === 0) return base;

  const seen = new Set(base.map((entry) => entry.relativePath));
  const additions: ProjectFileIndexEntry[] = [];
  for (const group of loadedGroups) {
    for (const entry of group) {
      if (seen.has(entry.relativePath)) continue;
      seen.add(entry.relativePath);
      additions.push(entry);
    }
  }

  return [...base, ...additions];
};

/**
 * Fills in directories the project index deliberately left empty.
 *
 * `git ls-files --directory` reports a fully ignored folder as a single entry,
 * so its children never reach the tree and the row expands into nothing. Here
 * each such row is read from disk the first time it is expanded — one level per
 * expand, so an ignored subtree costs a read only when someone opens it, and
 * `node_modules` is still never walked.
 */
export const useCollapsedDirectoryEntries = ({
  deviceId,
  entries,
  expandedIds,
  root,
}: UseCollapsedDirectoryEntriesParams): UseCollapsedDirectoryEntriesResult => {
  const [loaded, setLoaded] = useState<Record<string, ProjectFileIndexEntry[]>>({});
  const [truncatedPaths, setTruncatedPaths] = useState<string[]>([]);
  // Requests in flight, so a re-render mid-read can't queue the same directory twice.
  const pending = useSingleton(() => new Set<string>());

  useEffect(() => {
    setLoaded({});
    setTruncatedPaths([]);
    pending.clear();
  }, [deviceId, pending, root]);

  const mergedEntries = useMemo(() => mergeEntries(entries, loaded), [entries, loaded]);

  const collapsedPaths = useMemo(
    () =>
      new Set(mergedEntries.filter((entry) => entry.collapsed).map((entry) => entry.relativePath)),
    [mergedEntries],
  );

  useEffect(() => {
    const targets = expandedIds.filter(
      (id) => collapsedPaths.has(id) && !loaded[id] && !pending.has(id),
    );
    if (targets.length === 0) return;

    for (const relativePath of targets) pending.add(relativePath);

    let cancelled = false;
    void Promise.all(
      targets.map(async (relativePath) => {
        try {
          const result = await projectFileService.listProjectDirectory({
            deviceId,
            relativePath,
            root,
          });
          if (cancelled) return;

          setLoaded((prev) => ({ ...prev, [relativePath]: result?.entries ?? [] }));
          if (result?.truncated) {
            setTruncatedPaths((prev) =>
              prev.includes(relativePath) ? prev : [...prev, relativePath],
            );
          }
        } catch (error) {
          console.error('[Files] Failed to list project directory:', error);
          // Cache the empty result: without it the failed directory is retried
          // on every render for as long as it stays expanded.
          if (!cancelled) setLoaded((prev) => ({ ...prev, [relativePath]: [] }));
        } finally {
          pending.delete(relativePath);
        }
      }),
    );

    return () => {
      cancelled = true;
    };
  }, [collapsedPaths, deviceId, expandedIds, loaded, pending, root]);

  const invalidate = useCallback(
    (relativePath: string) => {
      pending.delete(relativePath);
      setLoaded((prev) => {
        const next: Record<string, ProjectFileIndexEntry[]> = {};
        let changed = false;
        for (const [key, value] of Object.entries(prev)) {
          // Drop the directory itself and anything indexed below it.
          if (key === relativePath || key.startsWith(relativePath)) {
            changed = true;
            continue;
          }
          next[key] = value;
        }
        return changed ? next : prev;
      });
    },
    [pending],
  );

  return { entries: mergedEntries, invalidate, truncatedPaths };
};
