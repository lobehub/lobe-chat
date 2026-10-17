import type { DeviceGitLinkedPullRequest, WorkingDirGithubState } from '@lobechat/types';

import { type GitLinkedPRSummary } from '@/services/git';
import { useFetchGitBranch, useFetchGitLinkedPR } from '@/store/device';

/** The git context the topic recorded for the working directory. */
export interface PullRequestSnapshot {
  branch?: string;
  github?: WorkingDirGithubState;
}

interface ResolveLinkedPullRequestInput {
  /** The working directory is readable here (local machine or a bound device). */
  available: boolean;
  branch?: { branch?: string; detached?: boolean };
  branchConfirmed: boolean;
  linkedPR?: GitLinkedPRSummary;
  linkedPRConfirmed: boolean;
  snapshot?: PullRequestSnapshot;
}

/**
 * The PR the sidebar shows for the working directory, and whether it may be
 * acted on. Persisted rows and the topic snapshot are enough to paint the tab;
 * only a PR that this session's branch read and linked-PR lookup both
 * confirmed may be mutated — a stale row could otherwise close or merge a PR
 * the repository has since moved off.
 */
export const resolveLinkedPullRequest = ({
  available,
  branch,
  branchConfirmed,
  linkedPR,
  linkedPRConfirmed,
  snapshot,
}: ResolveLinkedPullRequestInput): {
  confirmed: boolean;
  pullRequest: DeviceGitLinkedPullRequest | null | undefined;
} => {
  const snapshotPR =
    !branch || (snapshot?.branch === branch.branch && !branch.detached)
      ? snapshot?.github?.pullRequest
      : undefined;
  // A settled empty lookup supersedes the snapshot; failures may keep displaying it.
  const pullRequest = available
    ? linkedPR?.pullRequestStatus === 'ok'
      ? linkedPR.pullRequest
      : (linkedPR?.pullRequest ?? snapshotPR)
    : undefined;
  const confirmed =
    !!pullRequest &&
    branchConfirmed &&
    linkedPRConfirmed &&
    linkedPR?.pullRequest?.number === pullRequest.number;
  return { confirmed, pullRequest };
};

/** Branch → linked PR for the Working Sidebar's PR tab. */
export const useLinkedPullRequest = ({
  available,
  deviceId,
  gitPath,
  isGithub,
  snapshot,
}: {
  available: boolean;
  deviceId?: string;
  /** Set only for a readable GitHub working directory. */
  gitPath?: string;
  isGithub: boolean;
  snapshot?: PullRequestSnapshot;
}) => {
  const { data: branch, isConfirmed: branchConfirmed } = useFetchGitBranch(deviceId, gitPath);
  const {
    data: linkedPR,
    isConfirmed: linkedPRConfirmed,
    mutate: refresh,
  } = useFetchGitLinkedPR(deviceId, gitPath, branch?.branch, isGithub);
  return {
    ...resolveLinkedPullRequest({
      available,
      branch,
      branchConfirmed,
      linkedPR,
      linkedPRConfirmed,
      snapshot,
    }),
    refresh,
  };
};
