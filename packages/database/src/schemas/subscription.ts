import { index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';

export const subscriptions = pgTable(
  'subscriptions',
  {
    
currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),

    
// active | expired | canceled
currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),

    
id: varchar('id', { length: 40 }).primaryKey(), 

    
paymentOrderCode: varchar('payment_order_code', { length: 64 }), 

    
plan: varchar('plan', { length: 24 }).notNull(),
    
// matches Plans enum values
status: varchar('status', { length: 16 }).notNull().default('active'),

    
userId: varchar('user_id', { length: 64 }).notNull(),

    ...timestamps,
  },
  (t) => [index('subscriptions_user_idx').on(t.userId)],
);

export type SubscriptionItem = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
