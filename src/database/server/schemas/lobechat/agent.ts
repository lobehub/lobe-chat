/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, jsonb, pgTable, primaryKey, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { LobeAgentChatConfig, LobeAgentTTSConfig } from '@/types/agent';

import { idGenerator, randomSlug } from '../../utils/idGenerator';
import { createdAt, updatedAt } from './_helpers';
import { files, knowledgeBases } from './file';
import { users } from './user';

// Agent table is the main table for storing agents
// agent is a model that represents the assistant that is created by the user
// agent can have its own knowledge base and files

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

export const agentsKnowledgeBases = pgTable(
  'agents_knowledge_bases',
  {
    agentId: text('agent_id')
      .references(() => agents.id, { onDelete: 'cascade' })
      .notNull(),
    knowledgeBaseId: text('knowledge_base_id')
      .references(() => knowledgeBases.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    enabled: boolean('enabled').default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.agentId, t.knowledgeBaseId] }),
  }),
);

export const agentsFiles = pgTable(
  'agents_files',
  {
    fileId: text('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    agentId: text('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    enabled: boolean('enabled').default(true),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.fileId, t.agentId, t.userId] }),
  }),
);
