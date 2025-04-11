/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, jsonb, pgTable, primaryKey, text, timestamp, varchar } from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { users } from './user';

/**
 * OIDC 授权码
 * oidc-provider 需要持久化的模型之一
 */
export const oidcAuthorizationCodes = pgTable('oidc_authorization_codes', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  consumedAt: timestamp('consumed_at', { mode: 'date' }),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: text('client_id').notNull(),
  grantId: text('grant_id'),
  ...timestamps,
});

/**
 * OIDC 访问令牌
 * oidc-provider 需要持久化的模型之一
 */
export const oidcAccessTokens = pgTable('oidc_access_tokens', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  consumedAt: timestamp('consumed_at', { mode: 'date' }),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: text('client_id').notNull(),
  grantId: text('grant_id'),
  ...timestamps,
});

/**
 * OIDC 刷新令牌
 * oidc-provider 需要持久化的模型之一
 */
export const oidcRefreshTokens = pgTable('oidc_refresh_tokens', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  consumedAt: timestamp('consumed_at', { mode: 'date' }),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: text('client_id').notNull(),
  grantId: text('grant_id'),
  ...timestamps,
});

/**
 * OIDC 设备代码
 * oidc-provider 需要持久化的模型之一
 */
export const oidcDeviceCodes = pgTable('oidc_device_codes', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  consumedAt: timestamp('consumed_at', { mode: 'date' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull(),
  grantId: text('grant_id'),
  userCode: text('user_code'),
  ...timestamps,
});

/**
 * OIDC 交互会话
 * oidc-provider 需要持久化的模型之一
 */
export const oidcInteractions = pgTable('oidc_interactions', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  ...timestamps,
});

/**
 * OIDC 授权记录
 * oidc-provider 需要持久化的模型之一
 */
export const oidcGrants = pgTable('oidc_grants', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  consumedAt: timestamp('consumed_at', { mode: 'date' }),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: text('client_id').notNull(),
  ...timestamps,
});

/**
 * OIDC 客户端配置
 * 存储 OIDC 客户端配置信息
 */
export const oidcClients = pgTable('oidc_clients', {
  id: text('id').primaryKey(), // client_id
  name: text('name').notNull(),
  description: text('description'),
  clientSecret: text('client_secret'), // 公共客户端可为 null
  redirectUris: jsonb('redirect_uris').$type<string[]>().notNull(),
  grants: jsonb('grants').$type<string[]>().notNull(),
  responseTypes: jsonb('response_types').$type<string[]>().notNull(),
  scopes: jsonb('scopes').$type<string[]>().notNull(),
  tokenEndpointAuthMethod: varchar('token_endpoint_auth_method', { length: 20 }),
  applicationType: varchar('application_type', { length: 20 }),
  clientUri: text('client_uri'),
  logoUri: text('logo_uri'),
  policyUri: text('policy_uri'),
  tosUri: text('tos_uri'),
  isFirstParty: boolean('is_first_party').default(false),
  ...timestamps,
});

/**
 * OIDC 会话
 * oidc-provider 需要持久化的模型之一
 */
export const oidcSessions = pgTable('oidc_sessions', {
  id: text('id').primaryKey(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  ...timestamps,
});

/**
 * OIDC 授权同意记录
 * 记录用户对客户端的授权同意历史
 */
export const oidcConsents = pgTable(
  'oidc_consents',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: text('client_id')
      .references(() => oidcClients.id, { onDelete: 'cascade' })
      .notNull(),
    scopes: jsonb('scopes').$type<string[]>().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }),
    ...timestamps,
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.clientId] }),
  }),
);
