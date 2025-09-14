import { pgTable, serial, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const agents = pgTable('agents', {
    // e.g., 'business', 'supervisor', 'subagent'
    config: jsonb('config'),

    // e.g., 'active', 'inactive', 'pending'
    createdAt: timestamp('created_at').defaultNow(),


    id: serial('id').primaryKey(),

    name: varchar('name', { length: 128 }),

    // agent configuration, instructions, etc.
    status: varchar('status', { length: 32 }),

    type: varchar('type', { length: 64 }),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
