/* eslint-disable sort-keys-fix/sort-keys-fix  */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { idGenerator } from '@/database/utils/idGenerator';

import { accessedAt, createdAt, timestamps } from './_helpers';
import { asyncTasks } from './asyncTask';
import { users } from './user';

export const globalFiles = pgTable('global_files', {
  hashId: varchar('hash_id', { length: 64 }).primaryKey(),
  fileType: varchar('file_type', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  metadata: jsonb('metadata'),
  creator: text('creator')
    .references(() => users.id, { onDelete: 'set null' })
    .notNull(),
  createdAt: createdAt(),
  accessedAt: accessedAt(),
});

export type NewGlobalFile = typeof globalFiles.$inferInsert;
export type GlobalFileItem = typeof globalFiles.$inferSelect;

export const files = pgTable(
  'files',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('files'))
      .primaryKey(),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    fileType: varchar('file_type', { length: 255 }).notNull(),
    fileHash: varchar('file_hash', { length: 64 }).references(() => globalFiles.hashId, {
      onDelete: 'no action',
    }),
    name: text('name').notNull(),
    size: integer('size').notNull(),
    url: text('url').notNull(),

    clientId: text('client_id'),
    metadata: jsonb('metadata'),
    chunkTaskId: uuid('chunk_task_id').references(() => asyncTasks.id, { onDelete: 'set null' }),
    embeddingTaskId: uuid('embedding_task_id').references(() => asyncTasks.id, {
      onDelete: 'set null',
    }),

    ...timestamps,
  },
  (table) => {
    return {
      fileHashIdx: index('file_hash_idx').on(table.fileHash),
      clientIdUnique: uniqueIndex('files_client_id_user_id_unique').on(
        table.clientId,
        table.userId,
      ),
    };
  },
);
export type NewFile = typeof files.$inferInsert;
export type FileItem = typeof files.$inferSelect;

export const knowledgeBases = pgTable(
  'knowledge_bases',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('knowledgeBases'))
      .primaryKey(),

    name: text('name').notNull(),
    description: text('description'),
    avatar: text('avatar'),

    // different types of knowledge bases need to be distinguished
    type: text('type'),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: text('client_id'),

    isPublic: boolean('is_public').default(false),

    settings: jsonb('settings'),

    ...timestamps,
  },
  (t) => ({
    clientIdUnique: uniqueIndex('knowledge_bases_client_id_user_id_unique').on(
      t.clientId,
      t.userId,
    ),
  }),
);

export const insertKnowledgeBasesSchema = createInsertSchema(knowledgeBases);

export type NewKnowledgeBase = typeof knowledgeBases.$inferInsert;
export type KnowledgeBaseItem = typeof knowledgeBases.$inferSelect;

export const knowledgeBaseFiles = pgTable(
  'knowledge_base_files',
  {
    knowledgeBaseId: text('knowledge_base_id')
      .references(() => knowledgeBases.id, { onDelete: 'cascade' })
      .notNull(),

    fileId: text('file_id')
      .references(() => files.id, { onDelete: 'cascade' })
      .notNull(),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    createdAt: createdAt(),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.knowledgeBaseId, t.fileId],
    }),
  }),
);
