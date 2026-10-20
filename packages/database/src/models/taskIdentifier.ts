import type { NewTask, TaskItem } from '@lobechat/types';
import type { SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

import { tasks } from '../schemas/task';
import type { LobeChatDatabase } from '../type';

export const isTaskIdentifierUniqueViolation = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  const cause = error instanceof Error ? error.cause : undefined;

  return (
    code === '23505' ||
    message.includes('23505') ||
    message.includes('duplicate') ||
    message.includes('unique') ||
    (!!cause && isTaskIdentifierUniqueViolation(cause))
  );
};

/**
 * Inserts a task with the next `<prefix>-<seq>` identifier in its ownership scope.
 *
 * Use when:
 * - Creating a task row; concurrent creates (parallel tool calls) may race for one seq
 *
 * Expects:
 * - `seqWhere` is visibility-blind, because the `(workspace_id, identifier)` unique
 *   constraint ignores visibility
 * - `db` may be a caller-owned transaction
 *
 * Returns:
 * - The inserted task; rethrows after `maxRetries` identifier conflicts
 */
export const insertTaskWithNextIdentifier = async (
  db: LobeChatDatabase,
  params: {
    identifierPrefix: string;
    maxRetries: number;
    seqWhere: SQL;
    values: Omit<NewTask, 'identifier' | 'seq'>;
  },
): Promise<TaskItem> => {
  for (let attempt = 0; attempt < params.maxRetries; attempt++) {
    try {
      // Each attempt runs in its own (nested) transaction so a unique violation rolls back
      // only that savepoint and never aborts a caller-owned transaction.
      return await db.transaction(async (tx) => {
        const seqResult = await tx
          .select({ maxSeq: sql<number>`COALESCE(MAX(${tasks.seq}), 0)` })
          .from(tasks)
          .where(params.seqWhere);

        const seq = Number(seqResult[0].maxSeq) + 1;
        const [task] = await tx
          .insert(tasks)
          .values({ ...params.values, identifier: `${params.identifierPrefix}-${seq}`, seq })
          .returning();

        return task;
      });
    } catch (error) {
      if (isTaskIdentifierUniqueViolation(error) && attempt < params.maxRetries - 1) continue;
      throw error;
    }
  }

  throw new Error('Failed to create task after max retries');
};
