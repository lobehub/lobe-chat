import type { TaskDetailActivity, TaskDetailActivityAuthor } from '@lobechat/types';

/** Distinguishes a locally synthesized row from a persisted one until the refetch replaces it. */
export const OPTIMISTIC_ASSIGNMENT_ID_PREFIX = 'optimistic-assignment-';

export interface BuildOptimisticAssignmentInput {
  /** Who is making the change; without one no row is synthesized rather than inventing an actor. */
  actor?: TaskDetailActivityAuthor;
  /** `undefined` = slot untouched, `null` = cleared. Mirrors `TaskUpdatePayload`. */
  assigneeAgentId?: string | null;
  assigneeUserId?: string | null;
  /** The assignees before this edit, for the no-op check and the `from` side. */
  current: { agentId?: string | null; userId?: string | null };
  now: string;
  /** Display metadata for the newly chosen assignee, handed in by the picker that has it. */
  target?: TaskDetailActivityAuthor;
}

/**
 * Synthesize the assignment rows the server is about to persist, so the feed
 * moves in the same beat as the assignee chip instead of two round-trips later.
 *
 * Only a slot that actually changes produces a row — the same rule the server
 * applies — so re-saving the same assignee stays silent here too. The refetch
 * that follows the mutation replaces the whole activity array, which retires
 * these rows without any reconciliation; a failed mutation is rolled back by
 * that same refetch.
 */
export const buildOptimisticAssignmentActivities = ({
  actor,
  assigneeAgentId,
  assigneeUserId,
  current,
  now,
  target,
}: BuildOptimisticAssignmentInput): TaskDetailActivity[] => {
  if (!actor) return [];

  const rows: TaskDetailActivity[] = [];
  const side = (
    id: string | null | undefined,
    type: TaskDetailActivityAuthor['type'],
  ): TaskDetailActivityAuthor | null => {
    if (!id) return null;
    return target?.id === id ? target : { id, name: null, type };
  };

  if (assigneeAgentId !== undefined && assigneeAgentId !== (current.agentId ?? null)) {
    rows.push({
      assignment: {
        from: side(current.agentId, 'agent'),
        kind: 'agent',
        to: side(assigneeAgentId, 'agent'),
      },
      author: actor,
      id: `${OPTIMISTIC_ASSIGNMENT_ID_PREFIX}agent-${now}`,
      time: now,
      type: 'assignment',
    });
  }

  if (assigneeUserId !== undefined && assigneeUserId !== (current.userId ?? null)) {
    rows.push({
      assignment: {
        from: side(current.userId, 'user'),
        kind: 'member',
        to: side(assigneeUserId, 'user'),
      },
      author: actor,
      id: `${OPTIMISTIC_ASSIGNMENT_ID_PREFIX}member-${now}`,
      time: now,
      type: 'assignment',
    });
  }

  return rows;
};
