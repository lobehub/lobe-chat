import type { WorkingDirConfig, WorkingDirEntry } from '@lobechat/types';

import {
  getWorkingDirectoryName,
  getWorkingDirectoryPathString,
} from '@/helpers/workingDirectoryPath';

export interface StaleWorktreeReset {
  /** The entry to commit: the source repo with the worktree override dropped. */
  entry: WorkingDirEntry;
  /** The source repo's folder name, for the button label. */
  name?: string;
}

/**
 * The way out of a "working directory not found" failure caused by a deleted
 * worktree: the topic still records `git.activeWorktree`, so every retry spawns
 * in the dead checkout. Falling back to the source repo the worktree was linked
 * from is always safe — the CLI session is anchored there — and is the only
 * recovery a project conversation has, since its directory picker is hidden.
 *
 * Undefined when there is no worktree override to drop, or when the missing
 * directory is the source repo itself (resetting would land in the same place).
 */
export const resolveStaleWorktreeReset = (
  config: WorkingDirConfig | undefined,
  missingPath?: string,
): StaleWorktreeReset | undefined => {
  const sourcePath = getWorkingDirectoryPathString(config?.path);
  const worktreePath = getWorkingDirectoryPathString(config?.git?.activeWorktree);
  if (!sourcePath || !worktreePath || worktreePath === sourcePath) return undefined;
  if (missingPath && missingPath === sourcePath) return undefined;

  return {
    // The branch, upstream and PR described the worktree's branch, not the
    // source repo's, so they go with it — same as an `ExitWorktree`.
    entry: { path: sourcePath, ...(config?.repoType ? { repoType: config.repoType } : {}) },
    name: getWorkingDirectoryName(sourcePath),
  };
};
