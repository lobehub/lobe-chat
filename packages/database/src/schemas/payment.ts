import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';

/**
 * Payments table for Vietnam market (Sepay/PayOS etc.)
 * Minimal fields to track payment lifecycle.
 */
export const payments = pgTable(
  'payments',
  {
    // Amount in VND (integer)
amount: integer('amount').notNull(),

    
    
currency: varchar('currency', { length: 8 }).default('VND'),
    

description: text('description'),

    
    
// Gateway and status
gateway: varchar('gateway', { length: 32 }).default('sepay'),
    

gatewayResponse: jsonb('gateway_response').$type<Record<string, any>>(),

    
    
id: varchar('id', { length: 30 }).primaryKey(),
    // Business identifiers
orderCode: varchar('order_code', { length: 64 }).notNull(), 

    
    // Timestamps
paidAt: timestamp('paid_at', { withTimezone: true }),
    


referenceCode: varchar('reference_code', { length: 128 }),
    


status: varchar('status', { length: 16 }).notNull().default('pending'),
    


transactionDate: varchar('transaction_date', { length: 64 }),

    
    // pending | completed | failed
// Webhook/transaction info
transactionId: varchar('transaction_id', { length: 64 }),
    ...timestamps,
  },
  (t) => [uniqueIndex('payments_order_code_unique').on(t.orderCode)],
);

export type NewPayment = typeof payments.$inferInsert;
export type PaymentItem = typeof payments.$inferSelect;
