/* eslint-disable sort-keys-fix/sort-keys-fix  */
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
  varchar,
  vector,
} from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { files } from './file';
import { users } from './user';

export const chunks = pgTable(
  'chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    text: text('text'),
    abstract: text('abstract'),
    metadata: jsonb('metadata'),
    index: integer('index'),
    type: varchar('type'),

    clientId: text('client_id'),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),

    ...timestamps,
  },
  (t) => [
    uniqueIndex('chunks_client_id_user_id_unique').on(t.clientId, t.userId),
    index('chunks_user_id_idx').on(t.userId),
  ],
);

export type NewChunkItem = typeof chunks.$inferInsert & { fileId?: string };

export const unstructuredChunks = pgTable(
  'unstructured_chunks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    text: text('text'),
    metadata: jsonb('metadata'),
    index: integer('index'),
    type: varchar('type'),

    ...timestamps,

    parentId: varchar('parent_id'),
    compositeId: uuid('composite_id').references(() => chunks.id, { onDelete: 'cascade' }),
    clientId: text('client_id'),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    fileId: varchar('file_id').references(() => files.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    clientIdUnique: uniqueIndex('unstructured_chunks_client_id_user_id_unique').on(
      t.clientId,
      t.userId,
    ),
  }),
);

export type NewUnstructuredChunkItem = typeof unstructuredChunks.$inferInsert;

export const embeddings = pgTable(
  'embeddings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    chunkId: uuid('chunk_id')
      .references(() => chunks.id, { onDelete: 'cascade' })
      .unique(),
    embeddings: vector('embeddings', { dimensions: 1024 }),
    model: text('model'),
    clientId: text('client_id'),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => [
    uniqueIndex('embeddings_client_id_user_id_unique').on(t.clientId, t.userId),
    // improve delete embeddings query
    index('embeddings_chunk_id_idx').on(t.chunkId),
  ],
);

export type NewEmbeddingsItem = typeof embeddings.$inferInsert;
export type EmbeddingsSelectItem = typeof embeddings.$inferSelect;
