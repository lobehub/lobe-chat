/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, jsonb, pgTable, primaryKey, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { documents } from '@/database/schemas/document';
import { idGenerator } from '@/database/utils/idGenerator';
import { ChatTopicMetadata } from '@/types/topic';

import { createdAt, timestamps, timestamptz } from './_helpers';
import { sessions } from './session';
import { users } from './user';

export const topics = pgTable(
  'topics',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('topics'))
      .primaryKey(),
    title: text('title'),
    favorite: boolean('favorite').default(false),
    sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: text('client_id'),
    historySummary: text('history_summary'),
    metadata: jsonb('metadata').$type<ChatTopicMetadata | undefined>(),
    ...timestamps,
  },
  (t) => [uniqueIndex('topics_client_id_user_id_unique').on(t.clientId, t.userId)],
);

export type NewTopic = typeof topics.$inferInsert;
export type TopicItem = typeof topics.$inferSelect;

// @ts-ignore
export const threads = pgTable(
  'threads',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('threads', 16))
      .primaryKey(),

    title: text('title'),
    type: text('type', { enum: ['continuation', 'standalone'] }).notNull(),
    status: text('status', { enum: ['active', 'deprecated', 'archived'] }).default('active'),
    topicId: text('topic_id')
      .references(() => topics.id, { onDelete: 'cascade' })
      .notNull(),
    sourceMessageId: text('source_message_id').notNull(),
    // @ts-ignore
    parentThreadId: text('parent_thread_id').references(() => threads.id, { onDelete: 'set null' }),
    clientId: text('client_id'),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    lastActiveAt: timestamptz('last_active_at').defaultNow(),
    ...timestamps,
  },
  (t) => [uniqueIndex('threads_client_id_user_id_unique').on(t.clientId, t.userId)],
);

export type NewThread = typeof threads.$inferInsert;
export type ThreadItem = typeof threads.$inferSelect;
export const insertThreadSchema = createInsertSchema(threads);

/**
 * 文档与话题关联表 - 实现文档和话题的多对多关系
 */
export const topicDocuments = pgTable(
  'topic_documents',
  {
    documentId: text('document_id')
      .notNull()
      .references(() => documents.id, { onDelete: 'cascade' }),

    topicId: text('topic_id')
      .notNull()
      .references(() => topics.id, { onDelete: 'cascade' }),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.documentId, t.topicId] })],
);

export type NewTopicDocument = typeof topicDocuments.$inferInsert;
export type TopicDocumentItem = typeof topicDocuments.$inferSelect;
