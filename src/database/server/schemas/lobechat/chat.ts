/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { LobeAgentChatConfig, LobeAgentTTSConfig } from '@/types/agent';
import { CustomPluginParams } from '@/types/tool/plugin';

import { idGenerator, randomSlug } from '../../utils/idGenerator';
import { createdAt, updatedAt } from './_helpers';
import { files } from './file';
import { users } from './user';

export const installedPlugins = pgTable(
  'user_installed_plugins',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    identifier: text('identifier').notNull(),
    type: text('type', { enum: ['plugin', 'customPlugin'] }).notNull(),
    manifest: jsonb('manifest').$type<LobeChatPluginManifest>(),
    settings: jsonb('settings'),
    customParams: jsonb('custom_params').$type<CustomPluginParams>(),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (self) => ({
    id: primaryKey({ columns: [self.userId, self.identifier] }),
  }),
);

export type NewInstalledPlugin = typeof installedPlugins.$inferInsert;
export type InstalledPluginItem = typeof installedPlugins.$inferSelect;

//  ======= agents ======= //
export const agents = pgTable('agents', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => idGenerator('agents'))
    .notNull(),
  slug: varchar('slug', { length: 100 })
    .$defaultFn(() => randomSlug())
    .unique(),
  title: text('title'),
  description: text('description'),
  tags: jsonb('tags').$type<string[]>().default([]),
  avatar: text('avatar'),
  backgroundColor: text('background_color'),

  plugins: jsonb('plugins').$type<string[]>().default([]),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  chatConfig: jsonb('chat_config').$type<LobeAgentChatConfig>(),

  fewShots: jsonb('few_shots'),
  model: text('model'),
  params: jsonb('params').default({}),
  provider: text('provider'),
  systemRole: text('system_role'),
  tts: jsonb('tts').$type<LobeAgentTTSConfig>(),

  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const insertAgentSchema = createInsertSchema(agents);

export type NewAgent = typeof agents.$inferInsert;
export type AgentItem = typeof agents.$inferSelect;

//  ======= sessionGroups ======= //

export const sessionGroups = pgTable(
  'session_groups',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('sessionGroups'))
      .primaryKey(),
    name: text('name').notNull(),
    sort: integer('sort'),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    clientId: text('client_id'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => ({
    clientIdUnique: unique('session_group_client_id_user_unique').on(table.clientId, table.userId),
  }),
);

export const insertSessionGroupSchema = createInsertSchema(sessionGroups);

export type NewSessionGroup = typeof sessionGroups.$inferInsert;
export type SessionGroupItem = typeof sessionGroups.$inferSelect;

//  ======= sessions ======= //

export const sessions = pgTable(
  'sessions',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('sessions'))
      .primaryKey(),
    slug: varchar('slug', { length: 100 })
      .notNull()
      .$defaultFn(() => randomSlug()),
    title: text('title'),
    description: text('description'),
    avatar: text('avatar'),
    backgroundColor: text('background_color'),

    type: text('type', { enum: ['agent', 'group'] }).default('agent'),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    groupId: text('group_id').references(() => sessionGroups.id, { onDelete: 'set null' }),
    clientId: text('client_id'),
    pinned: boolean('pinned').default(false),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    slugUserIdUnique: uniqueIndex('slug_user_id_unique').on(t.slug, t.userId),

    clientIdUnique: unique('sessions_client_id_user_id_unique').on(t.clientId, t.userId),
  }),
);

export const insertSessionSchema = createInsertSchema(sessions);
// export const selectSessionSchema = createSelectSchema(sessions);

export type NewSession = typeof sessions.$inferInsert;
export type SessionItem = typeof sessions.$inferSelect;

//  ======== topics ======= //
export const topics = pgTable(
  'topics',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('topics'))
      .primaryKey(),
    sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    favorite: boolean('favorite').default(false),
    title: text('title'),
    clientId: text('client_id'),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    clientIdUnique: unique('topic_client_id_user_id_unique').on(t.clientId, t.userId),
  }),
);

export type NewTopic = typeof topics.$inferInsert;
export type TopicItem = typeof topics.$inferSelect;

//  ======== messages ======= //
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
    // @ts-ignore
    parentId: text('parent_id').references(() => messages.id, { onDelete: 'set null' }),
    quotaId: text('quota_id').references(() => messages.id, { onDelete: 'set null' }),

    // used for group chat
    agentId: text('agent_id').references(() => agents.id, { onDelete: 'set null' }),

    createdAt: createdAt(),
    updatedAt: updatedAt(),
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

export const agentsToSessions = pgTable(
  'agents_to_sessions',
  {
    agentId: text('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.agentId, t.sessionId] }),
  }),
);

export const filesToMessages = pgTable(
  'files_to_messages',
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

export const filesToSessions = pgTable(
  'files_to_sessions',
  {
    fileId: text('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.fileId, t.sessionId] }),
  }),
);

export const filesToAgents = pgTable(
  'files_to_agents',
  {
    fileId: text('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    agentId: text('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.fileId, t.agentId] }),
  }),
);
