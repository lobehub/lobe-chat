import type { DeviceGitPullRequestMergeContext } from '@lobechat/types';

interface ActionLockInput {
  /** The sidebar's branch + linked-PR reads confirmed this PR number. */
  confirmed: boolean;
  context: DeviceGitPullRequestMergeContext | null | undefined;
  contextConfirmed: boolean;
  contextError: unknown;
  detailConfirmed: boolean;
}

/**
 * What the PR pane may act on. Persisted rows keep painting; mutations wait:
 *
 * - `locked`: the PR itself (branch, linked PR, detail) is not confirmed yet —
 *   every action, comments included, is refused.
 * - `policyLocked`: the merge context (permissions, required checks, base
 *   drift) on screen is last session's — policy-driven actions (merge, update,
 *   bypass, close / reopen, change base) wait for the live read.
 *
 * A failed context read drops the cached policy rather than locking forever:
 * the pane falls back to the core detail, as it does with no context at all.
 */
export const resolvePullRequestActionLock = ({
  confirmed,
  context,
  contextConfirmed,
  contextError,
  detailConfirmed,
}: ActionLockInput) => {
  const usableContext = contextConfirmed || !contextError ? context : undefined;
  return {
    context: usableContext,
    locked: !confirmed || !detailConfirmed,
    policyLocked: usableContext !== undefined && !contextConfirmed,
  };
};
