/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';
import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { DEFAULT_PREFERENCE } from '@/const/user';
import { LobeAgentChatConfig, LobeAgentTTSConfig } from '@/types/agent';
import { CustomPluginParams } from '@/types/tool/plugin';

import { idGenerator, randomSlug } from '../utils/idGenerator';

const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

const createdAt = () => timestamptz('created_at').notNull().defaultNow();
const updatedAt = () => timestamptz('updated_at').notNull().defaultNow();

/**
 * This table stores users. Users are created in Clerk, then Clerk calls a
 * webhook at /api/webhook/clerk to inform this application a user was created.
 */
export const users = pgTable('users', {
  // The ID will be the user's ID from Clerk
  id: text('id').primaryKey().notNull(),
  username: text('username').unique(),
  email: text('email'),

  avatar: text('avatar'),
  phone: text('phone'),
  firstName: text('first_name'),
  lastName: text('last_name'),

  isOnboarded: boolean('is_onboarded').default(false),
  // Time user was created in Clerk
  clerkCreatedAt: timestamptz('clerk_created_at'),

  preference: jsonb('preference').$defaultFn(() => DEFAULT_PREFERENCE),

  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type NewUser = typeof users.$inferInsert;
export type UserItem = typeof users.$inferSelect;

export const userSubscriptions = pgTable('user_subscriptions', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  stripeId: text('stripe_id'),

  currency: text('currency'),
  pricing: integer('pricing'),
  billingPaidAt: integer('billing_paid_at'),
  billingCycleStart: integer('billing_cycle_start'),
  billingCycleEnd: integer('billing_cycle_end'),

  cancelAtPeriodEnd: boolean('cancel_at_period_end'),
  cancelAt: integer('cancel_at'),

  nextBilling: jsonb('next_billing'),

  plan: text('plan'),
  recurring: text('recurring'),

  storageLimit: integer('storage_limit'),

  status: integer('status'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type UserSubscriptionItem = typeof userSubscriptions.$inferSelect;

export const userBudgets = pgTable('user_budgets', {
  id: text('id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  freeBudgetId: text('free_budget_id'),
  freeBudgetKey: text('free_budget_key'),

  subscriptionBudgetId: text('subscription_budget_id'),
  subscriptionBudgetKey: text('subscription_budget_key'),

  packageBudgetId: text('package_budget_id'),
  packageBudgetKey: text('package_budget_key'),

  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type NewUserBudgets = typeof userBudgets.$inferInsert;
export type UserBudgetItem = typeof userBudgets.$inferSelect;

export const userSettings = pgTable('user_settings', {
  id: text('id')
    .references(() => users.id, { onDelete: 'cascade' })
    .primaryKey(),

  tts: jsonb('tts'),
  keyVaults: text('key_vaults'),
  general: jsonb('general'),
  languageModel: jsonb('language_model'),
  systemAgent: jsonb('system_agent'),
  defaultAgent: jsonb('default_agent'),
  tool: jsonb('tool'),
});

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name'),

  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const files = pgTable('files', {
  id: text('id')
    .$defaultFn(() => idGenerator('files'))
    .primaryKey(),

  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  fileType: varchar('file_type', { length: 255 }).notNull(),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),

  metadata: jsonb('metadata'),

  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type NewFile = typeof files.$inferInsert;
export type FileItem = typeof files.$inferSelect;

export const plugins = pgTable('plugins', {
  id: serial('id').primaryKey(),
  identifier: text('identifier').notNull().unique(),

  title: text('title').notNull(),
  description: text('description'),
  avatar: text('avatar'),
  author: text('author'),

  manifest: text('manifest').notNull(),
  locale: text('locale').notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

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

export const pluginsTags = pgTable(
  'plugins_tags',
  {
    pluginId: integer('plugin_id')
      .notNull()
      .references(() => plugins.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.pluginId, t.tagId] }),
  }),
);

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

export const agentsTags = pgTable(
  'agents_tags',
  {
    agentId: text('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.agentId, t.tagId] }),
  }),
);
export const insertAgentSchema = createInsertSchema(agents);

export type NewAgent = typeof agents.$inferInsert;
export type AgentItem = typeof agents.$inferSelect;

//  ======= market ======= //

export const market = pgTable('market', {
  id: serial('id').primaryKey(),

  agentId: text('agent_id').references(() => agents.id, { onDelete: 'cascade' }),
  pluginId: integer('plugin_id').references(() => plugins.id, { onDelete: 'cascade' }),

  type: text('type', { enum: ['plugin', 'model', 'agent', 'group'] }).notNull(),

  view: integer('view').default(0),
  like: integer('like').default(0),
  used: integer('used').default(0),

  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

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

export const filesRelations = relations(files, ({ many }) => ({
  filesToMessages: many(filesToMessages),
  filesToSessions: many(filesToSessions),
  filesToAgents: many(filesToAgents),
}));

export const topicRelations = relations(topics, ({ one }) => ({
  session: one(sessions, {
    fields: [topics.sessionId],
    references: [sessions.id],
  }),
}));

export const pluginsRelations = relations(plugins, ({ many }) => ({
  pluginsTags: many(pluginsTags),
}));

export const pluginsTagsRelations = relations(pluginsTags, ({ one }) => ({
  plugin: one(plugins, {
    fields: [pluginsTags.pluginId],
    references: [plugins.id],
  }),
  tag: one(tags, {
    fields: [pluginsTags.tagId],
    references: [tags.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  agentsTags: many(agentsTags),
  pluginsTags: many(pluginsTags),
}));

export const messagesRelations = relations(messages, ({ many, one }) => ({
  filesToMessages: many(filesToMessages),

  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),

  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
  }),

  topic: one(topics, {
    fields: [messages.topicId],
    references: [topics.id],
  }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  agentsToSessions: many(agentsToSessions),
  filesToAgents: many(filesToAgents),
  agentsTags: many(agentsTags),
}));

export const agentsToSessionsRelations = relations(agentsToSessions, ({ one }) => ({
  session: one(sessions, {
    fields: [agentsToSessions.sessionId],
    references: [sessions.id],
  }),
  agent: one(agents, {
    fields: [agentsToSessions.agentId],
    references: [agents.id],
  }),
}));

export const filesToAgentsRelations = relations(filesToAgents, ({ one }) => ({
  agent: one(agents, {
    fields: [filesToAgents.agentId],
    references: [agents.id],
  }),
  file: one(files, {
    fields: [filesToAgents.fileId],
    references: [files.id],
  }),
}));

export const filesToMessagesRelations = relations(filesToMessages, ({ one }) => ({
  file: one(files, {
    fields: [filesToMessages.fileId],
    references: [files.id],
  }),
  message: one(messages, {
    fields: [filesToMessages.messageId],
    references: [messages.id],
  }),
}));

export const filesToSessionsRelations = relations(filesToSessions, ({ one }) => ({
  file: one(files, {
    fields: [filesToSessions.fileId],
    references: [files.id],
  }),
  session: one(sessions, {
    fields: [filesToSessions.sessionId],
    references: [sessions.id],
  }),
}));

export const agentsTagsRelations = relations(agentsTags, ({ one }) => ({
  agent: one(agents, {
    fields: [agentsTags.agentId],
    references: [agents.id],
  }),
  tag: one(tags, {
    fields: [agentsTags.tagId],
    references: [tags.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ many, one }) => ({
  filesToSessions: many(filesToSessions),
  agentsToSessions: many(agentsToSessions),
  group: one(sessionGroups, {
    fields: [sessions.groupId],
    references: [sessionGroups.id],
  }),
}));
