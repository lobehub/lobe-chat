import type { WorkingDirEntry } from '@lobechat/types';
import { useCallback } from 'react';

import { useCommitWorkingDirectory } from './useCommitWorkingDirectory';

interface UseSwitchWorktreeOptions {
  agentId: string;
  isGithub: boolean;
  /** The repo the conversation is anchored to; worktrees are recorded relative to it. */
  sourcePath: string;
}

/**
 * Point the working directory at a worktree. Shared by the worktree dropdown,
 * the create-worktree flow, and the branch dropdown — which routes into the
 * worktree holding a branch rather than attempting a checkout git would reject.
 */
export const useSwitchWorktree = ({ agentId, isGithub, sourcePath }: UseSwitchWorktreeOptions) => {
  const { commit } = useCommitWorkingDirectory(agentId);

  return useCallback(
    async (worktreePath: string, branch?: string) => {
      const entry: WorkingDirEntry = {
        // Selecting the source repo itself clears the worktree override. The
        // branch is recorded with the worktree because it is the only label the
        // control bar has left once the worktree directory is deleted.
        ...(worktreePath === sourcePath
          ? {}
          : { git: { activeWorktree: worktreePath, ...(branch ? { branch } : {}) } }),
        path: sourcePath,
        repoType: isGithub ? 'github' : 'git',
      };
      await commit(entry);
    },
    [commit, isGithub, sourcePath],
  );
};
