import type {
  DeviceGitAheadBehind,
  DeviceGitWorkingTreeStatus,
  DeviceGitWorktreeListItem,
} from '@lobechat/types';

import { defineReplica } from '@/libs/replica';
import type { GitBranchSummary } from '@/services/git';

/**
 * The small per-(device, directory) git reads behind the Working Sidebar
 * Overview and the chat-input git chips. They are replicas so a reload paints
 * the last branch / ahead-behind / dirty counts / worktrees on the first frame
 * and the device read only confirms them.
 *
 * Only branch / upstream / count shapes are kept — no diffs, no credentials.
 * Rows are partitioned by the cache scope (user + workspace) and keyed by
 * device + path, so two devices that share a path never paint each other's
 * state.
 */
export interface GitStatusParams {
  /** Remote device; `undefined` reads this machine over Electron IPC. */
  deviceId?: string;
  path: string;
}

/** `local` stands for this machine, like the SWR device keys. */
export const gitStatusKey = ({ deviceId, path }: GitStatusParams) =>
  `${deviceId ?? 'local'}\u0000${path}`;

/**
 * One answered read. The value is wrapped so a read that answered with nothing
 * (no upstream, unreachable device: `value` absent) still replaces a stale
 * persisted row — a bare `undefined` / `null` response would leave it in place.
 */
export interface GitStatusRead<T> {
  value?: T;
}

/** Directories a user works in; old ones fall out of storage, not out of the app. */
const persist = { maxEntries: 50 };

export const gitBranchResource = defineReplica<GitStatusParams, GitStatusRead<GitBranchSummary>>({
  key: gitStatusKey,
  name: 'deviceGitBranch',
  persist,
  storage: 'indexedDB',
  version: 1,
});

export const gitAheadBehindResource = defineReplica<
  GitStatusParams,
  GitStatusRead<DeviceGitAheadBehind>
>({
  key: gitStatusKey,
  name: 'deviceGitAheadBehind',
  persist,
  storage: 'indexedDB',
  version: 1,
});

export const gitWorkingTreeStatusResource = defineReplica<
  GitStatusParams,
  GitStatusRead<DeviceGitWorkingTreeStatus>
>({
  key: gitStatusKey,
  name: 'deviceGitWorkingTreeStatus',
  persist,
  storage: 'indexedDB',
  version: 1,
});

export const gitWorktreesResource = defineReplica<
  GitStatusParams,
  GitStatusRead<DeviceGitWorktreeListItem[]>
>({
  key: gitStatusKey,
  name: 'deviceGitWorktrees',
  persist,
  storage: 'indexedDB',
  version: 1,
});
