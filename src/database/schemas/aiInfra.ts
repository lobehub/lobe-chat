/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, integer, jsonb, pgTable, text, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from '@/database/schemas/_helpers';
import { users } from '@/database/schemas/user';

export const aiProviders = pgTable(
  'ai_providers',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),

    providerId: varchar('provider_id', { length: 64 }).notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    sort: integer('sort'),
    enabled: boolean('enabled'),
    checkModel: text('check_model'),
    logo: text('logo'),
    // OpenAI /  Anthropic / Gemini API schema
    sdkType: text('sdk_type'),
    name: text('name').notNull(),
    description: text('description'),

    models: jsonb('models'),
    // need to be encrypted
    config: text(),

    ...timestamps,
  },
  (table) => [uniqueIndex('provider_id_user_unique').on(table.providerId, table.userId)],
);
