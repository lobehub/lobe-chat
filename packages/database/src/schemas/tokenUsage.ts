/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { index, integer, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils/idGenerator';
import { users } from './user';

/**
 * Token usage tracking table
 * Tracks all AI model token consumption per user
 */
export const tokenUsage = pgTable(
  'token_usage',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('tokenUsage'))
      .primaryKey()
      .notNull(),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    conversationId: text('conversation_id'), // Optional: link to specific conversation/session

    // Model information
    model: text('model').notNull(), // e.g., 'gemini-flash', 'gpt-4o-mini', 'claude-3-5-sonnet'
    provider: text('provider').notNull(), // e.g., 'google', 'openai', 'anthropic'

    // Token counts
    inputTokens: integer('input_tokens').notNull().default(0),
    outputTokens: integer('output_tokens').notNull().default(0),
    totalTokens: integer('total_tokens').notNull().default(0),

    // Cost in EUR cents (e.g., 150 = €1.50)
    estimatedCost: numeric('estimated_cost', { precision: 10, scale: 2 }).default('0').notNull(),

    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (self) => [
    // Index for querying by user and time range
    index('token_usage_user_id_timestamp_idx').on(self.userId, self.timestamp),
    // Index for time-based queries (monthly reports, etc.)
    index('token_usage_timestamp_idx').on(self.timestamp),
    // Index for provider analytics
    index('token_usage_provider_idx').on(self.provider),
  ],
);

export type NewTokenUsage = typeof tokenUsage.$inferInsert;
export type TokenUsageItem = typeof tokenUsage.$inferSelect;
