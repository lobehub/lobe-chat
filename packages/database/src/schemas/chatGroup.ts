/* eslint-disable sort-keys-fix/sort-keys-fix  */
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { idGenerator } from '@/database/utils/idGenerator';
import type { ChatGroupConfig } from '@/database/types/chatGroup';

import { timestamps } from './_helpers';
import { agents } from './agent';
import { users } from './user';

/**
 * Chat groups table for multi-agent conversations
 * Allows multiple agents to participate in a single chat session
 */
export const chatGroups = pgTable(
  'chat_groups',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => idGenerator('chatGroups'))
      .notNull(),
    title: text('title'),
    description: text('description'),

    /**
     * Group configuration
     */
    config: jsonb('config').$type<ChatGroupConfig>(),

    clientId: text('client_id'),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    pinned: boolean('pinned').default(false),

    ...timestamps,
  },
  (t) => [uniqueIndex('chat_groups_client_id_user_id_unique').on(t.clientId, t.userId)],
);

export const insertChatGroupSchema = createInsertSchema(chatGroups);

export type NewChatGroup = typeof chatGroups.$inferInsert;
export type ChatGroupItem = typeof chatGroups.$inferSelect;

/**
 * Junction table connecting chat groups with agents
 * Defines which agents participate in each group chat
 */
export const chatGroupsAgents = pgTable(
  'chat_groups_agents',
  {
    chatGroupId: text('chat_group_id')
      .references(() => chatGroups.id, { onDelete: 'cascade' })
      .notNull(),
    agentId: text('agent_id')
      .references(() => agents.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    /**
     * Whether this agent is active in the group
     */
    enabled: boolean('enabled').default(true),

    /**
     * Display or speaking order of the agent in the group
     */
    order: integer('order').default(0),

    /**
     * Role of the agent in the group (e.g., 'moderator', 'participant')
     */
    role: text('role').default('participant'),

    ...timestamps,
  },
  (t) => ({
    pk: primaryKey({ columns: [t.chatGroupId, t.agentId] }),
  }),
);

export type NewChatGroupAgent = typeof chatGroupsAgents.$inferInsert;
export type ChatGroupAgentItem = typeof agents.$inferInsert