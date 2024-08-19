/* eslint-disable sort-keys-fix/sort-keys-fix  */
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
} from 'drizzle-orm/pg-core';

import { DEFAULT_PREFERENCE } from '@/const/user';

import { createdAt, timestamptz, updatedAt } from './_helpers';

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
  fullName: text('full_name'),

  isOnboarded: boolean('is_onboarded').default(false),
  // Time user was created in Clerk
  clerkCreatedAt: timestamptz('clerk_created_at'),

  // Required by nextauth, all null allowed
  emailVerifiedAt: timestamptz('email_verified_at'),

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
