/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { timestamps, timestamptz } from './_helpers';
import { users } from './user';

export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  key: text('key').notNull().unique(),
  description: text('description'),
  enabled: boolean('enabled').default(true),
  expiresAt: timestamptz('expires_at'),
  lastUsedAt: timestamptz('last_used_at'),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
});

export const insertApiKeySchema = createInsertSchema(apiKeys);

export type ApiKeyItem = typeof apiKeys.$inferSelect;
export type NewApiKeyItem = typeof apiKeys.$inferInsert;
