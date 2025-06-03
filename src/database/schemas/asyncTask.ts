/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './user';

export const asyncTasks = pgTable('async_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type'),

  status: text('status'),
  error: jsonb('error'),

  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  duration: integer('duration'),

  /** 推理任务 ID，用于 webhook 回调识别 */
  // inferenceId: varchar('inference_id', { length: 128 }),

  /** 推理结束时间，不论成功或失败 */
  // finalizedAt: timestamptz('finalized_at'),

  ...timestamps,
});

export type NewAsyncTaskItem = typeof asyncTasks.$inferInsert;
export type AsyncTaskSelectItem = typeof asyncTasks.$inferSelect;
