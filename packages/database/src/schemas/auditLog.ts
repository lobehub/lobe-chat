/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils/idGenerator';
import { users } from './user';

/**
 * Audit log table
 * Tracks all admin actions for compliance and security
 */
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('auditLogs'))
      .primaryKey()
      .notNull(),

    // Admin who performed the action
    adminId: text('admin_id')
      .references(() => users.id, { onDelete: 'set null' })
      .notNull(),

    // Action type
    action: text('action').notNull(), // e.g., 'user_created', 'tier_changed', 'user_suspended', 'user_approved', 'token_limit_changed'

    // Target user (if applicable)
    targetUserId: text('target_user_id').references(() => users.id, { onDelete: 'set null' }),

    // Additional details as JSON
    details: jsonb('details'), // e.g., { oldTier: 'free', newTier: 'pro', reason: 'Payment received' }

    // IP address and user agent for security
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (self) => [
    // Index for querying by admin
    index('audit_logs_admin_id_timestamp_idx').on(self.adminId, self.timestamp),
    // Index for querying by target user
    index('audit_logs_target_user_id_idx').on(self.targetUserId),
    // Index for querying by action type
    index('audit_logs_action_idx').on(self.action),
    // Index for time-based queries
    index('audit_logs_timestamp_idx').on(self.timestamp),
  ],
);

export type NewAuditLog = typeof auditLogs.$inferInsert;
export type AuditLogItem = typeof auditLogs.$inferSelect;
