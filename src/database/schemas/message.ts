/* eslint-disable sort-keys-fix/sort-keys-fix  */
import {
  boolean,
  index,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';

import { idGenerator } from '@/database/utils/idGenerator';

import { timestamps } from './_helpers';
import { agents } from './agent';
import { files } from './file';
import { chunks, embeddings } from './rag';
import { sessions } from './session';
import { threads, topics } from './topic';
import { users } from './user';

// @ts-ignore
export const messages = pgTable(
  'messages',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('messages'))
      .primaryKey(),

    role: text('role', { enum: ['user', 'system', 'assistant', 'tool'] }).notNull(),
    content: text('content'),

    model: text('model'),
    provider: text('provider'),

    favorite: boolean('favorite').default(false),
    error: jsonb('error'),

    tools: jsonb('tools'),

    traceId: text('trace_id'),
    observationId: text('observation_id'),

    clientId: text('client_id'),

    // foreign keys
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    topicId: text('topic_id').references(() => topics.id, { onDelete: 'cascade' }),
    threadId: text('thread_id').references(() => threads.id, { onDelete: 'cascade' }),
    // @ts-ignore
    parentId: text('parent_id').references(() => messages.id, { onDelete: 'set null' }),
    quotaId: text('quota_id').references(() => messages.id, { onDelete: 'set null' }),

    // used for group chat
    agentId: text('agent_id').references(() => agents.id, { onDelete: 'set null' }),

    ...timestamps,
  },
  (table) => ({
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
    messageClientIdUnique: uniqueIndex('message_client_id_user_unique').on(
      table.clientId,
      table.userId,
    ),
  }),
);

export type NewMessage = typeof messages.$inferInsert;
export type MessageItem = typeof messages.$inferSelect;

// if the message container a plugin
export const messagePlugins = pgTable('message_plugins', {
  id: text('id')
    .references(() => messages.id, { onDelete: 'cascade' })
    .primaryKey(),

  toolCallId: text('tool_call_id'),
  type: text('type', {
    enum: ['default', 'markdown', 'standalone', 'builtin'],
  }).default('default'),

  apiName: text('api_name'),
  arguments: text('arguments'),
  identifier: text('identifier'),
  state: jsonb('state'),
  error: jsonb('error'),
});

export type MessagePluginItem = typeof messagePlugins.$inferSelect;
export const updateMessagePluginSchema = createSelectSchema(messagePlugins);

export const messageTTS = pgTable('message_tts', {
  id: text('id')
    .references(() => messages.id, { onDelete: 'cascade' })
    .primaryKey(),
  contentMd5: text('content_md5'),
  fileId: text('file_id').references(() => files.id, { onDelete: 'cascade' }),
  voice: text('voice'),
});

export const messageTranslates = pgTable('message_translates', {
  id: text('id')
    .references(() => messages.id, { onDelete: 'cascade' })
    .primaryKey(),
  content: text('content'),
  from: text('from'),
  to: text('to'),
});

// if the message contains a file
// save the file id and message id
export const messagesFiles = pgTable(
  'messages_files',
  {
    fileId: text('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    messageId: text('message_id')
      .notNull()
      .references(() => messages.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.fileId, t.messageId] }),
  }),
);

export const messageQueries = pgTable('message_queries', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: text('message_id')
    .references(() => messages.id, { onDelete: 'cascade' })
    .notNull(),
  rewriteQuery: text('rewrite_query'),
  userQuery: text('user_query'),
  embeddingsId: uuid('embeddings_id').references(() => embeddings.id, { onDelete: 'set null' }),
});

export type NewMessageQuery = typeof messageQueries.$inferInsert;

export const messageQueryChunks = pgTable(
  'message_query_chunks',
  {
    messageId: text('id').references(() => messages.id, { onDelete: 'cascade' }),
    queryId: uuid('query_id').references(() => messageQueries.id, { onDelete: 'cascade' }),
    chunkId: uuid('chunk_id').references(() => chunks.id, { onDelete: 'cascade' }),
    similarity: numeric('similarity', { precision: 6, scale: 5 }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.chunkId, t.messageId, t.queryId] }),
  }),
);
export type NewMessageFileChunk = typeof messageQueryChunks.$inferInsert;

// convert message content to the chunks
// then we can use message as the RAG source
export const messageChunks = pgTable(
  'message_chunks',
  {
    messageId: text('message_id').references(() => messages.id, { onDelete: 'cascade' }),
    chunkId: uuid('chunk_id').references(() => chunks.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.chunkId, t.messageId] }),
  }),
);
