/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { integer, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { idGenerator } from '../../utils/idGenerator';
import { createdAt, updatedAt } from './_helpers';
import { users } from './user';

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
