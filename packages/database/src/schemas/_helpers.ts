import { timestamp } from 'drizzle-orm/pg-core';

export const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const createdAt = () => timestamptz('created_at').notNull().defaultNow();
export const updatedAt = () =>
  timestamptz('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
export const accessedAt = () => timestamptz('accessed_at').notNull().defaultNow();

// columns.helpers.ts
export const timestamps = {
  accessedAt: accessedAt(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
};
