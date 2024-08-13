/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { integer, pgTable, primaryKey, serial, text } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt } from './_helpers';
import { agents } from './chat';
import { users } from './user';

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
