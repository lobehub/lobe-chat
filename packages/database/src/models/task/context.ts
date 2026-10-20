import { and, eq, isNull, type SQL, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';

import {
  taskActivities,
  taskComments,
  taskDependencies,
  taskDocuments,
  tasks,
  taskTopics,
} from '../../schemas/task';
import type { LobeChatDatabase } from '../../type';
import { buildWorkspaceWhere } from '../../utils/workspace';

/**
 * The scope every `TaskModel` helper runs in. Passed as the first argument to
 * the free functions in this directory instead of `this`, so the helper
 * modules never import the `TaskModel` class.
 */
export interface TaskModelContext {
  db: LobeChatDatabase;
  userId: string;
  workspaceId?: string;
}

/**
 * Ownership helpers in this model come in three flavors. Choose by USE CASE,
 * not by table — picking the wrong one led to a `seq` allocation hotfix
 * (see git log).
 *
 * ┌────────────────────┬──────────────────────────────────────────────┬────────────────────────┐
 * │ Helper             │ Use for                                      │ Visibility-aware?      │
 * ├────────────────────┼──────────────────────────────────────────────┼────────────────────────┤
 * │ taskOwnership()    │ list / read / per-row find on `tasks`        │ YES — public OR owner  │
 * │ taskOwnershipSql() │ raw-SQL CTEs that need the same predicate    │ YES — public OR owner  │
 * │ childOwnership()   │ task_dependencies / task_documents /         │ YES when caller passes │
 * │                    │ task_comments etc. (per-child-table)         │ the visibility column  │
 * │ seqOwnership()     │ identifier / seq allocation on `tasks`       │ NO — workspace-wide    │
 * │                    │ (the `(workspace_id, identifier)` unique     │ (visibility filter     │
 * │                    │ constraint is workspace-wide, regardless     │ would skip other       │
 * │                    │ of visibility)                               │ members' rows and      │
 * │                    │                                              │ collide on insert)     │
 * └────────────────────┴──────────────────────────────────────────────┴────────────────────────┘
 *
 * Personal mode (no workspace) is always `created_by_user_id = $self AND
 * workspace_id IS NULL` for all four helpers — visibility is inert because
 * everything personal is implicitly owner-only.
 */

/**
 * Compat-mode ownership predicate for the `tasks` table — **visibility-aware**.
 * `tasks` uses `createdByUserId` instead of `userId`. Workspace mode applies
 * visibility-aware filtering: public tasks are visible to every member,
 * private tasks only to their creator. Use this for every list/read path.
 * For identifier / seq allocation, use `seqOwnership` instead.
 */
export const taskOwnership = (ctx: TaskModelContext) =>
  buildWorkspaceWhere(
    { userId: ctx.userId, workspaceId: ctx.workspaceId },
    {
      isDeleted: tasks.isDeleted,
      userId: tasks.createdByUserId,
      visibility: tasks.visibility,
      workspaceId: tasks.workspaceId,
    },
  );

/**
 * Ownership predicate for task child tables (deps / docs / comments) that
 * use a `userId` column instead of `createdByUserId`. Pass `visibility` for
 * tables that mirror the parent task's visibility column; leave it omitted
 * for tables that stay workspace-shared (e.g. comments).
 */
export const childOwnership = (
  ctx: TaskModelContext,
  cols: {
    userId: AnyPgColumn;
    visibility?: AnyPgColumn;
    workspaceId: AnyPgColumn;
  },
) => buildWorkspaceWhere({ userId: ctx.userId, workspaceId: ctx.workspaceId }, cols);

/**
 * Workspace-wide ownership for `tasks.seq` / `identifier` allocation —
 * must NOT be visibility-filtered. The `(workspace_id, identifier)` unique
 * constraint is workspace-scoped regardless of visibility, so seq lookups
 * have to see every row in the workspace; otherwise creators of private
 * tasks can collide on identifiers belonging to other members' rows.
 */
export const seqOwnership = (ctx: TaskModelContext) =>
  ctx.workspaceId
    ? eq(tasks.workspaceId, ctx.workspaceId)
    : (and(eq(tasks.createdByUserId, ctx.userId), isNull(tasks.workspaceId)) as SQL);

/**
 * Raw-SQL ownership clause for use inside `db.execute(sql...)` CTEs that
 * can't easily compose with drizzle's `and(...)` helpers. Mirrors
 * `buildWorkspaceWhere` semantics:
 *   - workspace mode → `workspace_id = $ws AND (visibility = 'public' OR created_by_user_id = $userId)`
 *   - personal mode  → `created_by_user_id = $userId AND workspace_id IS NULL`
 */
export const taskOwnershipSql = (ctx: TaskModelContext, alias?: string) => {
  const prefix = alias ? sql.raw(`${alias}.`) : sql.raw('');
  return ctx.workspaceId
    ? sql`${prefix}workspace_id = ${ctx.workspaceId}
            AND (${prefix}visibility = 'public' OR ${prefix}created_by_user_id = ${ctx.userId})
            AND ${prefix}is_deleted IS NOT TRUE`
    : sql`${prefix}created_by_user_id = ${ctx.userId} AND ${prefix}workspace_id IS NULL AND ${prefix}is_deleted IS NOT TRUE`;
};

export const depsOwnership = (ctx: TaskModelContext) =>
  childOwnership(ctx, {
    userId: taskDependencies.userId,
    visibility: taskDependencies.visibility,
    workspaceId: taskDependencies.workspaceId,
  });

/** Only used by the demotion cascade in `TaskModel.updateVisibility` — regular
 *  taskTopics reads/writes live in `TaskTopicModel`. */
export const topicsOwnership = (ctx: TaskModelContext) =>
  childOwnership(ctx, {
    userId: taskTopics.userId,
    visibility: taskTopics.visibility,
    workspaceId: taskTopics.workspaceId,
  });

export const docsOwnership = (ctx: TaskModelContext) =>
  childOwnership(ctx, {
    userId: taskDocuments.userId,
    visibility: taskDocuments.visibility,
    workspaceId: taskDocuments.workspaceId,
  });

export const commentsOwnership = (ctx: TaskModelContext) =>
  childOwnership(ctx, {
    userId: taskComments.userId,
    visibility: taskComments.visibility,
    workspaceId: taskComments.workspaceId,
  });

export const activitiesOwnership = (ctx: TaskModelContext) =>
  childOwnership(ctx, {
    userId: taskActivities.userId,
    visibility: taskActivities.visibility,
    workspaceId: taskActivities.workspaceId,
  });

/**
 * Look up a task's visibility so child-row inserts (deps, docs, topics) can
 * mirror it without forcing every call site to know the value. Missing or
 * trashed parents fail closed so no child can be attached after deletion or
 * through a model constructed for the wrong scope.
 */
export const getTaskVisibility = async (
  ctx: TaskModelContext,
  taskId: string,
): Promise<'private' | 'public'> => {
  const row = await ctx.db
    .select({ visibility: tasks.visibility })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), taskOwnership(ctx)))
    .limit(1);
  if (!row[0]) throw new Error(`Task not found: ${taskId}`);
  return row[0].visibility;
};
