/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { idGenerator } from '@/database/utils/idGenerator';

import { timestamps } from './_helpers';
import { messages } from './message';
import { topics } from './topic';
import { users } from './user';

/**
 * Message groups table for multi-models parallel conversations
 * Allows multiple AI models to respond to the same user message in parallel
 */
// @ts-ignore
export const messageGroups = pgTable(
  'message_groups',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('messageGroups'))
      .notNull(),

    // 关联关系 - 只需要 topic 层级
    topicId: text('topic_id').references(() => topics.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    // 支持嵌套结构
    // @ts-ignore
    parentGroupId: text('parent_group_id').references(() => messageGroups.id, {
      onDelete: 'cascade',
    }),

    // 关联的用户消息
    userMessageId: text('user_message_id').references(() => messages.id, { onDelete: 'cascade' }),

    // 元数据
    title: text('title'), // 可选的组标题
    description: text('description'), // 可选的描述

    clientId: text('client_id'),

    ...timestamps,
  },
  (t) => [uniqueIndex('message_groups_client_id_user_id_unique').on(t.clientId, t.userId)],
);

export const insertMessageGroupSchema = createInsertSchema(messageGroups);

export type NewMessageGroup = typeof messageGroups.$inferInsert;
export type MessageGroupItem = typeof messageGroups.$inferSelect;
