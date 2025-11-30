import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { users } from './user';

// export const user = pgTable('betterauth_user', {
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   email: text('email').notNull().unique(),
//   emailVerified: boolean('email_verified').default(false).notNull(),
//   id: text('id').primaryKey(),
//   image: text('image'),
//   name: text('name').notNull(),
//   updatedAt: timestamp('updated_at')
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
// });

export const session = pgTable('auth_sessions', {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  id: text('id').primaryKey(),
  ipAddress: text('ip_address'),
  token: text('token').notNull().unique(),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const account = pgTable('accounts', {
  accessToken: text('access_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  accountId: text('account_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  id: text('id').primaryKey(),
  idToken: text('id_token'),
  password: text('password'),
  providerId: text('provider_id').notNull(),
  refreshToken: text('refresh_token'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  updatedAt: timestamp('updated_at')
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const verification = pgTable('verifications', {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  value: text('value').notNull(),
});
