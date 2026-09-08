import type { TaskDetailActivity, TaskDetailActivityAuthor } from '@lobechat/types';

/**
 * Distinguishes a locally synthesized row from a persisted one until the
 * refetch replaces it. Renderers use it to withhold actions (edit / delete)
 * that would otherwise hit the server with an id it has never seen.
 */
export const OPTIMISTIC_ACTIVITY_ID_PREFIX = 'optimistic-';

export const isOptimisticActivityId = (id?: string | null): boolean =>
  !!id && id.startsWith(OPTIMISTIC_ACTIVITY_ID_PREFIX);

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
      id: `${OPTIMISTIC_ACTIVITY_ID_PREFIX}assignment-agent-${now}`,
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
      id: `${OPTIMISTIC_ACTIVITY_ID_PREFIX}assignment-member-${now}`,
      time: now,
      type: 'assignment',
    });
  }

  return rows;
};

export interface BuildOptimisticCommentInput {
  actor?: TaskDetailActivityAuthor;
  content: string;
  editorData?: unknown;
  now: string;
  topicId?: string | null;
}

/**
 * The comment the server is about to persist, shown the moment it is sent.
 *
 * Attachments are deliberately absent: their metadata (urls, sizes) only
 * exists after the server has resolved the file ids, so they arrive with the
 * refetch. Agent-authored comments (client-first runtime) are not synthesized
 * — the store has no agent identity to attribute them to.
 */
export const buildOptimisticCommentActivity = ({
  actor,
  content,
  editorData,
  now,
  topicId,
}: BuildOptimisticCommentInput): TaskDetailActivity | undefined => {
  if (!actor) return undefined;
  return {
    author: actor,
    content,
    editorData,
    id: `${OPTIMISTIC_ACTIVITY_ID_PREFIX}comment-${now}`,
    time: now,
    topicId: topicId ?? null,
    type: 'comment',
  };
};
