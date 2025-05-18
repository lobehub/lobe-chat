import { text, integer, uniqueIndex, pgTable, doublePrecision, jsonb, timestamp, real } from 'drizzle-orm/pg-core'

import { idGenerator } from '../utils/idGenerator'

import { timestamps } from './_helpers'
import { users } from './user'
import { MessageMetadata } from '@/types/message';

export const spendLogs = pgTable(
    'spend_logs',
    {
        id: text('id')
            .$defaultFn(() => idGenerator('spendLogs', 16))
            .primaryKey(),
        // Model 信息
        model: text('model').notNull(),
        provider: text('provider').notNull(),
        // Pricing 信息
        spend: doublePrecision('spend').notNull().default(0.0),
        // 调用信息，谁用哪个API调用了
            // API 调用信息
        callType: text('call_type', { enum: ['chat', 'history_summary'] }).notNull(),
        ipAddress: text('ip_address'),
            // User Identify
        userId: text('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        orgId: text('org_id'),
        teamId: text('team_id'),
        // 性能信息
        ttft: real(),
        tps: real(),
        inputStartAt: timestamp('input_start_at'),
        outputStartAt: timestamp('output_start_at'),
        outputFinishAt: timestamp('output_finish_at'),
        // Usage 信息
        totalInputTokens: integer('total_input_tokens'),
        totalOutputTokens: integer('total_output_tokens'),
        totalTokens: integer('total_tokens'),
        
        metadata: jsonb('metadata').$type<MessageMetadata | undefined>(),
        ...timestamps,
    },
    (t) => [uniqueIndex('spend_logs_user_id_unique').on(t.userId)],
);

export type SpendLogItem = typeof spendLogs.$inferSelect;
export type NewSpendLog = typeof spendLogs.$inferInsert;